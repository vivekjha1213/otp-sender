const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');


const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/send-email-otp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    otp: Number,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
    service: 'YOUR_EMAIL_SERVICE',
    auth: {
        user: 'YOUR_EMAIL_ADDRESS',
        pass: 'YOUR_EMAIL_PASSWORD',
    },
});



app.post('/sendotp', async(req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
        from: 'YOUR_EMAIL_ADDRESS',
        to: email,
        subject: 'Your OTP for verification',
        text: `Your OTP is ${otp}`,
    };

    try {
        const user = await User.findOneAndUpdate({ email }, { email, otp }, { upsert: true, new: true });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send({ error: 'Failed to send OTP' });
            } else {
                console.log(`Email sent: ${info.response}`);
                res.send({ message: 'OTP sent successfully' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to send OTP' });
    }
});

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));