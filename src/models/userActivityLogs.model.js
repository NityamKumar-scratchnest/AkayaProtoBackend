import mongoose from 'mongoose';

const UserActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  method: { type: String, required: true },            // GET, POST, PUT, DELETE
  endpoint: { type: String, required: true },          // e.g. /api/settings/device-0001
  body: { type: Object },                               // request body if needed
  statusCode: { type: Number },                         // response status code
  ip: { type: String },                                 // IP address
  userAgent: { type: String },                          // user agent string
  createdAt: { type: Date, default: Date.now }
});

const UserActivityLog = mongoose.model('UserActivityLog', UserActivityLogSchema);
export default UserActivityLog;
