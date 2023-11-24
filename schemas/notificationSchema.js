const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notificationType: { type: String },
    opened: { type: Boolean, default: false },
    entityId: { type: mongoose.Schema.Types.ObjectId }

}, { timestamps: true });

notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
    try {
        let data = {
            userTo: userTo,
            userFrom: userFrom,
            notificationType: notificationType,
            entityId: entityId
        }
        await Notification.deleteOne(data);
        return Notification.create(data);

    } catch (error) {
        console.log(error)
    }
}

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;