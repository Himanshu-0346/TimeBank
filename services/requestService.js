const Request = require('../models/Request');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const socketUtils = require('../utils/sockets');

class RequestService {
  async createRequest(requestData, user) {
    const { title, description, category, requiredSkill, credits, isScheduled, scheduledDate, voiceNote } = requestData;
    const numericCredits = parseInt(credits, 10);

    if (user.credits < numericCredits) {
      throw new Error('Insufficient credits to post this request.');
    }

    user.credits -= numericCredits;
    await user.save();

    const request = await Request.create({
      title,
      description,
      category,
      requiredSkill,
      credits: numericCredits,
      poster: user._id,
      status: 'open',
      isScheduled: isScheduled === 'on',
      scheduledDate: isScheduled === 'on' ? scheduledDate : null,
      voiceNote: voiceNote || ''
    });

    await Transaction.create({
      fromUser: user._id,
      toUser: user._id,
      amount: numericCredits,
      type: isScheduled === 'on' ? 'escrow_held' : 'post_request',
      requestId: request._id
    });

    const io = socketUtils.getIo();
    io.to(`skill_${category}`).emit('new_request', {
      title: request.title,
      credits: request.credits,
      id: request._id
    });

    return request;
  }

  async getAllOpenRequests(userId) {
    return await Request.find({
      status: 'open',
      poster: { $ne: userId }
    })
      .populate('poster', 'name avatar')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  }

  async getMyRequests(userId) {
    return await Request.find({ poster: userId })
      .populate('poster', 'name avatar')
      .populate('helper', 'name avatar')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  }

  async getHelpingRequests(userId) {
    return await Request.find({ helper: userId })
      .populate('poster', 'name avatar')
      .populate('helper', 'name avatar')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  }

  async getRequestById(requestId) {
    const request = await Request.findById(requestId)
      .populate('poster', 'name avatar ratingAvg')
      .populate('helper', 'name avatar')
      .lean({ virtuals: true });

    if (!request) throw new Error('Request not found');

    let dispute = null;
    if (request.status === 'disputed') {
      dispute = await Dispute.findOne({ request: request._id }).lean();
    }

    return { request, dispute };
  }

  async acceptRequest(requestId, currentUser) {
    const request = await Request.findById(requestId);
    if (!request || request.status !== 'open') {
      throw new Error('Request cannot be accepted.');
    }

    if (request.poster.toString() === currentUser._id.toString()) {
      throw new Error('You cannot accept your own request.');
    }

    request.status = 'accepted';
    request.helper = currentUser._id;
    await request.save();

    if (!request.isScheduled) {
      currentUser.credits += request.credits;
      currentUser.helpsCount += 1;
      await currentUser.save();

      await Transaction.create({
        fromUser: request.poster,
        toUser: currentUser._id,
        amount: request.credits,
        type: 'help_completed',
        requestId: request._id
      });
    }

    await Transaction.create({
      fromUser: request.poster,
      toUser: currentUser._id,
      amount: 0,
      type: 'request_accepted',
      requestId: request._id
    });

    const io = socketUtils.getIo();
    io.to(request.poster.toString()).emit('notification', {
      type: 'request_accepted',
      message: `${currentUser.name} accepted your request "${request.title}".`
    });

    return request;
  }

  async completeRequest(requestId, currentUser) {
    const request = await Request.findById(requestId);
    if (!request || request.status !== 'accepted') {
      throw new Error('Request cannot be completed.');
    }

    if (request.helper?.toString() !== currentUser._id.toString()) {
      throw new Error('Only the helper can mark this complete.');
    }

    request.status = 'completed';
    await request.save();

    await Transaction.create({
      fromUser: request.poster,
      toUser: currentUser._id,
      amount: 0,
      type: 'task_completed',
      requestId: request._id
    });

    const io = socketUtils.getIo();
    io.to(request.poster.toString()).emit('notification', {
      type: 'task_completed',
      message: `${currentUser.name} marked "${request.title}" as completed.`
    });

    return request;
  }

  async claimEscrow(requestId, currentUser) {
    const request = await Request.findById(requestId);
    if (!request || request.status !== 'completed' || !request.isScheduled) {
      throw new Error('Invalid request for claim.');
    }

    if (request.helper?.toString() !== currentUser._id.toString()) {
      throw new Error('Only the helper can claim.');
    }

    if (request.paymentReleased) {
      throw new Error('Payment already released.');
    }

    if (new Date() < new Date(request.scheduledDate)) {
      throw new Error('Cannot claim before the scheduled date.');
    }

    request.paymentReleased = true;
    await request.save();

    currentUser.credits += request.credits;
    currentUser.helpsCount += 1;
    await currentUser.save();

    await Transaction.create({
      fromUser: request.poster,
      toUser: currentUser._id,
      amount: request.credits,
      type: 'escrow_released',
      requestId: request._id
    });

    const io = socketUtils.getIo();
    io.to(request.poster.toString()).emit('notification', {
      type: 'escrow_released',
      message: `${currentUser.name} claimed the escrowed credits for "${request.title}".`
    });

    return request;
  }
}

module.exports = new RequestService();
