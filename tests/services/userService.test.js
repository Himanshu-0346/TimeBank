const User = require('../../models/User');
const Review = require('../../models/Review');
const Request = require('../../models/Request');
const Transaction = require('../../models/Transaction');
const userService = require('../../services/userService');

jest.mock('../../models/User');
jest.mock('../../models/Review');
jest.mock('../../models/Request');
jest.mock('../../models/Transaction');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileData', () => {
    it('should return user profile data with stats and reviews', async () => {
      const mockUser = {
        _id: '1',
        name: 'John Doe',
        ratingAvg: 4.5,
        helpsCount: 2,
        credits: 100
      };
      const mockReviews = [{ id: 1, rating: 5 }];
      const mockTransactions = [
        { fromUser: '1', toUser: '2', amount: 0 },
        { fromUser: '3', toUser: '1', amount: 100 }
      ];

      User.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
      Review.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockReviews)
      });
      Request.countDocuments
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);
      Transaction.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTransactions)
      });

      const result = await userService.getProfileData('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(result.user).toEqual(mockUser);
      expect(result.reviews).toEqual(mockReviews);
      expect(result.stats.earned).toBe(100);
      expect(result.stats.spent).toBe(0);
      expect(result.stats.totalReviews).toBe(1);
      expect(result.stats.taskCompleted).toBe(2);
      expect(result.stats.taskCreated).toBe(5);
      expect(result.stats.currentCredits).toBe(100);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      await expect(userService.getProfileData('99')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = { name: 'Jane', bio: 'Dev', location: 'NY', skills: 'Node, React' };
      const expectedSkills = ['node', 'react'];
      const mockUpdatedUser = { _id: '1', name: 'Jane', skills: expectedSkills };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile('1', updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Jane', bio: 'Dev', location: 'NY', skills: expectedSkills },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });
});
