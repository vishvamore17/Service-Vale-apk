import { Client, Databases, Query } from 'node-appwrite';
import https from 'https';

export default async ({ req, res, log, error }) => {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Get current time and time 2 hours from now
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Format dates for query (YYYYMMDD)
    const formatDateForQuery = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    // Get pending services happening in the next 2 hours
    const services = await databases.listDocuments(
      process.env.DATABASE_ID || '681c428b00159abb5e8b',
      process.env.COLLECTION_ID || '681d92600018a87c1478',
      [
        Query.equal('status', 'pending'),
        Query.equal('notificationSent', false),
        Query.greaterThanEqual('serviceDate', formatDateForQuery(now)),
        Query.lessThanEqual('serviceDate', formatDateForQuery(twoHoursLater)),
        Query.orderAsc('serviceDate'),
        Query.orderAsc('serviceTime')
      ]
    );

    log(`Found ${services.documents.length} services to notify`);

    // Process each service
    for (const service of services.documents) {
      try {
        // Parse service date/time
        const serviceDate = new Date(
          `${service.serviceDate.slice(0, 4)}-${service.serviceDate.slice(4, 6)}-${service.serviceDate.slice(6, 8)}`
        );
        const [hours, minutes] = service.serviceTime.split(':').map(Number);
        serviceDate.setHours(hours, minutes, 0, 0);

        // Check if it's exactly 2 hours before service time
        const timeDiff = serviceDate.getTime() - now.getTime();
        if (timeDiff > 2 * 60 * 60 * 1000 || timeDiff <= 0) {
          continue;
        }

        // Format WhatsApp message
        const message = `Dear ${service.clientName},\n\n` +
          `Your ${service.serviceType} service is scheduled for:\n` +
          `📅 Date: ${service.serviceDate.slice(6, 8)}/${service.serviceDate.slice(4, 6)}/${service.serviceDate.slice(0, 4)}\n` +
          `⏰ Time: ${service.serviceTime}\n\n` +
          `Service Provider Details:\n` +
          `👨‍🔧 Name: ${service.serviceboyName}\n` +
          `📞 Contact: ${service.serviceboyContact}\n\n` +
          `Service Amount: ₹${service.billAmount}\n\n` +
          `Please be ready for the service.`;

        // Send via WhatsApp API
        await sendWhatsAppAPI({
          phoneNumber: service.phoneNumber,
          message: message,
          clientName: service.clientName
        });

        // Mark as notified in database
        await databases.updateDocument(
          process.env.DATABASE_ID || '681c428b00159abb5e8b',
          process.env.COLLECTION_ID || '681d92600018a87c1478',
          service.$id,
          {
            notificationSent: true,
            lastNotificationAt: new Date().toISOString()
          }
        );

        log(`Notification sent to ${service.clientName}`);

      } catch (err) {
        error(`Error processing service ${service.$id}: ${err.message}`);
      }
    }

    return res.json({ success: true, servicesProcessed: services.documents.length });

  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};

// WhatsApp API Integration
async function sendWhatsAppAPI({ phoneNumber, message, clientName }) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'mywhin.p.rapidapi.com',
      path: `/tg2wsp/${process.env.WHATSAPP_CHANNEL_ID}?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(message)}`,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'mywhin.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}
