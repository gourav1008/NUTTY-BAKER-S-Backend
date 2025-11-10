import nodemailer from 'nodemailer';
import Contact from '../models/Contact.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, occasionType, eventDate, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and message'
      });
    }

    // Save to database
    const contact = await Contact.create({
      name,
      email,
      phone,
      occasionType,
      eventDate,
      message
    });

    // Send email notification to admin
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Submission - ${occasionType || 'General Inquiry'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B9D;">New Contact Form Submission</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Occasion Type:</strong> ${occasionType || 'General Inquiry'}</p>
              <p><strong>Event Date:</strong> ${eventDate ? new Date(eventDate).toLocaleDateString() : 'Not specified'}</p>
              <p><strong>Message:</strong></p>
              <p style="background-color: white; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">
              Submitted on: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      // Send confirmation email to customer
      const customerMailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Thank you for contacting us!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B9D;">Thank You for Your Inquiry!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Your Message:</h3>
              <p>${message}</p>
            </div>
            <p>We typically respond within 24-48 hours.</p>
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Cake Baker Team</strong>
            </p>
          </div>
        `
      };

      await transporter.sendMail(customerMailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Thank you for your message! We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: contacts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
    }

    // Mark as read
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
