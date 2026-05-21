const notificationController = require('../../controllers/notificationController');
const notificationService = require('../../services/notificationService');

const rewardController = require('../../controllers/rewardController');
const rewardService = require('../../services/rewardService');

// Mock the services that the controllers depend on
jest.mock('../../services/notificationService');
jest.mock('../../services/rewardService');

describe('API Unit Tests Demo', () => {
  
  describe('API 1: GET /notifications', () => {
    it('should fetch notifications and render the notifications view', async () => {
      // 1. Setup our mock data
      const mockNotifications = [
        { id: 1, type: 'new_request', message: 'Test message', read: false }
      ];
      
      // Tell the mocked service to return our mock data
      notificationService.getNotifications.mockResolvedValue(mockNotifications);

      // 2. Mock the Request (req) and Response (res) objects
      const req = {};
      const res = {
        locals: { currentUser: { id: 10 } }, // Mocking the logged-in user
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // 3. Call the controller function (the API handler)
      await notificationController.getNotifications(req, res);

      // 4. Assertions: Check if the API behaved as expected
      expect(notificationService.getNotifications).toHaveBeenCalledWith(10);
      expect(res.render).toHaveBeenCalledWith('notifications/index', {
        title: 'Notifications',
        notifications: mockNotifications
      });
    });
  });

  describe('API 2: POST /rewards/claim/:id', () => {
    it('should claim a reward and redirect to the rewards page with success message', async () => {
      // 1. Mock the Request (req) and Response (res) objects
      const req = {
        params: { id: 5 } // The coupon ID in the URL
      };
      
      const res = {
        locals: { currentUser: { id: 10 } }, // Mocking the logged-in user
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Tell the mocked service to resolve successfully
      rewardService.claimReward.mockResolvedValue(true);

      // 2. Call the controller function (the API handler)
      await rewardController.claimReward(req, res);

      // 3. Assertions: Check if the API behaved as expected
      expect(rewardService.claimReward).toHaveBeenCalledWith(10, 5);
      expect(res.redirect).toHaveBeenCalledWith('/rewards?success=Coupon claimed successfully!');
    });

    it('should return a 400 error if the user has insufficient credits', async () => {
      const req = { params: { id: 5 } };
      const res = {
        locals: { currentUser: { id: 10 } },
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Make the service throw an error (e.g. not enough credits)
      rewardService.claimReward.mockRejectedValue(new Error('Insufficient credits'));

      await rewardController.claimReward(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/rewards?error=Insufficient%20credits');
    });
  });

});
