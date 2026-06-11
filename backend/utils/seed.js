import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Client from '../models/Client.js';
import Consultation from '../models/Consultation.js';
import Recording from '../models/Recording.js';
import Note from '../models/Note.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consultation-manager');
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Consultation.deleteMany({});
    await Recording.deleteMany({});
    await Note.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Collections cleared.');

    // 1. Seed Users
    console.log('Seeding user accounts...');
    
    // We create them using User.create to trigger pre-save hashing
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@crm.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });

    const consultant = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'consultant@crm.com',
      password: 'password123',
      role: 'consultant',
      isActive: true
    });

    const staff = await User.create({
      name: 'John Miller (Office Staff)',
      email: 'staff@crm.com',
      password: 'password123',
      role: 'staff',
      isActive: true
    });

    console.log(`Users seeded successfully:
- Admin: admin@crm.com / password123
- Consultant: consultant@crm.com / password123
- Staff: staff@crm.com / password123`);

    // 2. Seed Clients
    console.log('Seeding clients...');
    const client1 = await Client.create({
      name: 'Robert Downey',
      email: 'robert@marvel.com',
      phone: '+1-555-0199',
      address: '10880 Wilshire Blvd, Los Angeles, CA'
    });

    const client2 = await Client.create({
      name: 'Emma Watson',
      email: 'emma@hogwarts.edu',
      phone: '+44-20-7946-0958',
      address: 'Flat 4, 12 Baker Street, London, UK'
    });

    const client3 = await Client.create({
      name: 'Elon Musk',
      email: 'elon@spacex.com',
      phone: '+1-555-4321',
      address: 'Rocket Road, Hawthorne, CA'
    });
    console.log('Clients seeded.');

    // 3. Seed Consultations
    console.log('Seeding consultations...');
    const now = new Date();
    
    // Completed consultation (has recording)
    const cons1 = await Consultation.create({
      client: client1._id,
      consultant: consultant._id,
      consultationDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 0),
      duration: 45,
      status: 'completed',
      tags: ['medical-review', 'follow-up']
    });

    // Scheduled consultation
    const cons2 = await Consultation.create({
      client: client2._id,
      consultant: consultant._id,
      consultationDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
      duration: 30,
      status: 'scheduled',
      tags: ['therapy', 'initial-assessment']
    });

    // Cancelled consultation
    const cons3 = await Consultation.create({
      client: client3._id,
      consultant: admin._id, // admin acts as consultant here
      consultationDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 0),
      duration: 60,
      status: 'cancelled',
      tags: ['consultancy-contract']
    });
    console.log('Consultations seeded.');

    // 4. Seed Recording
    console.log('Seeding recording...');
    const recording = await Recording.create({
      title: 'Robert Downey - Follow Up Medical Assessment',
      consultation: cons1._id,
      recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Playable public MP3 audio stream
      fileType: 'mp3',
      fileSize: 4500000, // ~4.5 MB
      duration: 372, // 6m 12s
      uploadDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 15, 0),
      transcript: `Consultant (Dr. Sarah Jenkins): Good afternoon, Robert. Thank you for joining our follow-up medical review. How have you been feeling since we adjusted your prescription dose?
Client (Robert Downey): Thanks, Dr. Jenkins. The energy levels are definitely more stable, but I experienced some minor headaches during the first two days.
Consultant (Dr. Sarah Jenkins): Headaches are common when introducing this specific dosage adjustment. Did they subside after day two?
Client (Robert Downey): Yes, they went away completely. By Wednesday, I was feeling back to normal, and my sleep cycle has improved significantly.
Consultant (Dr. Sarah Jenkins): Excellent. I want you to keep recording your sleep metrics. We'll keep this dose active for the next month. If you experience any relapse in fatigue, please let me know.
Client (Robert Downey): Will do. I'll continue tracking my activity logs and send you the report before our next appointment.
Consultant (Dr. Sarah Jenkins): Perfect. Let's schedule our next review in four weeks. Have a great day.`,
      summary: `The session reviewed Robert's progress following prescription dosage adjustments. Robert reports improved energy levels and sleep cycles after minor initial headaches.`,
      discussionPoints: [
        `Evaluated initial headache side effects which resolved by day three.`,
        `Confirmed improved sleep cycles and fatigue reduction under new dosage.`,
        `Reviewed tracking parameters for daily activity and sleep metrics.`
      ],
      actionItems: [
        `Client (Robert Downey) to track daily sleep metrics and activity logs.`,
        `Client (Robert Downey) to email activity reports prior to next session.`,
        `Consultant (Dr. Sarah Jenkins) to schedule 4-week review appointment.`
      ]
    });
    console.log('Recording seeded.');

    // 5. Seed Notes
    console.log('Seeding notes...');
    await Note.create({
      consultation: cons1._id,
      author: consultant._id,
      content: `<p><strong>Clinical Notes - Follow Up Review</strong></p>
<p>Patient reports that sleep has improved from an average of 5 hours to 7.2 hours per night.</p>
<p>Recommended keeping the current medication dose for 30 more days. Scheduled follow-up.</p>`
    });

    await Note.create({
      consultation: cons2._id,
      author: consultant._id,
      content: `<p><strong>Pre-Assessment Review</strong></p>
<p>Initial documents received. Emma's intake form indicates high stress scores during university final exams.</p>`
    });
    console.log('Notes seeded.');

    // 6. Seed Notifications
    console.log('Seeding notifications...');
    await Notification.create({
      recipient: consultant._id,
      type: 'info',
      title: 'New Consultation Assigned',
      message: `You have been assigned to a new consultation with Emma Watson scheduled for tomorrow.`,
      readBy: []
    });

    await Notification.create({
      recipient: consultant._id,
      type: 'success',
      title: 'Recording Uploaded & Analyzed',
      message: `A recording was added to your consultation with Robert Downey. AI transcripts and summary cards are ready.`,
      readBy: [consultant._id] // Already read
    });

    await Notification.create({
      recipient: null, // Broadcast
      type: 'warning',
      title: 'Storage Capacity Alert',
      message: `Cloud storage space usage has reached 65% capacity. Check file settings.`,
      readBy: []
    });
    console.log('Notifications seeded.');

    // 7. Seed Activity Logs
    console.log('Seeding activity logs...');
    await ActivityLog.create({
      user: admin._id,
      action: 'LOGIN',
      details: 'Administrator logged in from system console',
      ipAddress: '127.0.0.1'
    });

    await ActivityLog.create({
      user: staff._id,
      action: 'CREATE_CLIENT',
      details: 'Created client profile for Elon Musk',
      ipAddress: '127.0.0.1'
    });

    await ActivityLog.create({
      user: staff._id,
      action: 'UPLOAD_RECORDING',
      details: `Uploaded recording: "${recording.title}"`,
      ipAddress: '127.0.0.1'
    });
    console.log('Activity logs seeded.');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedData();
