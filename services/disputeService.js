const User = require('../models/User');
const Request = require('../models/Request');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

class DisputeService {
  async getJuryDisputes(user) {
    if (user.helpsCount < 3) {
      throw new Error('Only Trusted Users (3+ helps) can access Jury Duty.');
    }

    return await Dispute.find({ status: { $in: ['open', 'voting'] } })
      .populate('request')
      .populate('initiator', 'name avatar helpsCount')
      .populate('defendant', 'name avatar helpsCount')
      .sort({ createdAt: -1 })
      .lean();
  }

  async raiseDispute(requestId, user, reason) {
    const request = await Request.findById(requestId);
    if (!request || !['accepted', 'completed'].includes(request.status)) {
      throw new Error('Cannot dispute this request state.');
    }

    const isPoster = request.poster.toString() === user._id.toString();
    const isHelper = request.helper?.toString() === user._id.toString();

    if (!isPoster && !isHelper) {
      throw new Error('Not authorized to dispute this request.');
    }

    const existing = await Dispute.findOne({ request: request._id });
    if (existing) {
      throw new Error('Dispute already active for this request.');
    }

    const defendantId = isPoster ? request.helper : request.poster;
    const dispute = await Dispute.create({
      request: request._id,
      initiator: user._id,
      defendant: defendantId,
      reason: reason.substring(0, 500)
    });

    request.status = 'disputed';
    await request.save();

    await Notification.create({
      recipient: defendantId,
      type: 'dispute_raised',
      message: `A dispute has been raised against you for "${request.title}". Please respond.`,
      link: `/requests/${request._id}`
    });

    return request;
  }

  async respondToDispute(disputeId, user, defendantResponse) {
    const dispute = await Dispute.findById(disputeId).populate('request');
    if (!dispute || dispute.status !== 'open') {
      throw new Error('Cannot respond to this dispute.');
    }

    if (dispute.defendant.toString() === user._id.toString()) {
      dispute.defendantResponse = defendantResponse.substring(0, 500);
      dispute.status = 'voting';
      await dispute.save();
      return dispute;
    }

    throw new Error('Only the defendant can respond.');
  }

  async voteOnDispute(disputeId, user, voteFor) {
    if (user.helpsCount < 3) {
      throw new Error('Not a trusted user.');
    }

    const dispute = await Dispute.findById(disputeId).populate('request');
    if (!dispute || dispute.status !== 'voting') {
      throw new Error('Dispute not open for voting.');
    }

    if (
      dispute.initiator.toString() === user._id.toString() ||
      dispute.defendant.toString() === user._id.toString()
    ) {
      throw new Error('Cannot vote on your own dispute.');
    }

    const alreadyVoted = dispute.votes.some(v => v.juror.toString() === user._id.toString());
    if (alreadyVoted) {
      throw new Error('Already voted.');
    }

    dispute.votes.push({ juror: user._id, voteFor });
    await dispute.save();

    if (dispute.votes.length >= 3) {
      const initVotes = dispute.votes.filter(v => v.voteFor.toString() === dispute.initiator.toString()).length;
      const defVotes = dispute.votes.filter(v => v.voteFor.toString() === dispute.defendant.toString()).length;
      const winnerId = initVotes > defVotes ? dispute.initiator.toString() : dispute.defendant.toString();
      const newStatus = winnerId === dispute.initiator.toString() ? 'resolved_initiator' : 'resolved_defendant';
      dispute.status = newStatus;
      await dispute.save();

      const reqDoc = dispute.request;
      const posterId = reqDoc.poster;
      const helperId = reqDoc.helper;

      if (winnerId === posterId.toString()) {
        await User.findByIdAndUpdate(posterId, { $inc: { credits: reqDoc.credits } });
        await Transaction.create({
          fromUser: helperId,
          toUser: posterId,
          amount: reqDoc.credits,
          type: 'dispute_refund',
          requestId: reqDoc._id
        });
        reqDoc.status = 'open';
        reqDoc.helper = null;
        if (reqDoc.isScheduled) reqDoc.paymentReleased = false;
        await reqDoc.save();
      } else {
        await User.findByIdAndUpdate(helperId, { $inc: { credits: reqDoc.credits, helpsCount: 1 } });
        await Transaction.create({
          fromUser: posterId,
          toUser: helperId,
          amount: reqDoc.credits,
          type: 'escrow_released',
          requestId: reqDoc._id
        });
        reqDoc.status = 'completed';
        if (reqDoc.isScheduled) reqDoc.paymentReleased = true;
        await reqDoc.save();
      }

      await Notification.create({
        recipient: dispute.initiator,
        type: 'dispute_resolved',
        message: `Your dispute for "${reqDoc.title}" has been resolved. You ${winnerId === dispute.initiator.toString() ? 'won' : 'lost'}.`,
        link: `/requests/${reqDoc._id}`
      });

      await Notification.create({
        recipient: dispute.defendant,
        type: 'dispute_resolved',
        message: `Your dispute for "${reqDoc.title}" has been resolved. You ${winnerId === dispute.defendant.toString() ? 'won' : 'lost'}.`,
        link: `/requests/${reqDoc._id}`
      });
    }

    return dispute;
  }
}

module.exports = new DisputeService();
