import { Client, Databases, Query } from 'node-appwrite';
import fetch from 'node-fetch'; // Needed for sending HTTP requests

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const databaseId = 'your_database_id';
  const collectionId = 'fcm_tokens';
  const userId = req.body?.userId; // Or from trigger context

  try {
    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('userId', userId)
    ]);

    const tokens = response.documents.map(doc => doc.token);

    // Send notification to each token via Expo
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: '🔔 New Notification!',
      body: 'You have a new update!',
      data: { withSome: 'data' },
    }));

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` // Optional if needed
      },
      body: JSON.stringify(messages),
    });

    const result = await expoRes.json();
    log(result);

    res.json({ success: true, sent: tokens.length });
  } catch (err) {
    error('Failed to send notifications');
    error(JSON.stringify(err));
    res.json({ success: false, error: err.message });
  }
};
