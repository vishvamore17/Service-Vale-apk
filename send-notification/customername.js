import { Client, Databases } from "node-appwrite";
import admin from "firebase-admin";

export default async ({ req, res, log, error }) => {
  try {
    // Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "servicevale-19ead",
        clientEmail: "firebase-adminsdk-xxx@servicevale-19ead.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3A/8me02e4RuW\nDix/0YqHV3C1aWF2JaB3Blql3VDK3lbAKe70hiEaHJvmH3/Vl85a/+FuuDyBhF79\nWlmIiIOqwzf8Mz1peetgExljjkzDnLv+6krDNclltTX15ObFitqXxJyGfeUtnrkT\nCG0JcvoIVp0ivZ/wcUIz/Z+Ivo8sOD4h+51HGJQ0KClI65/kYJytAGwhgsa/HSDF\niG1Dl6Fou0I/GnVCig6OBGmvZFyMgWL9asrZDRKSi3/WfdpJZqHRs0LEShFnS0+8\nMxUoWzRh2hN0QWz7IaVa1sSBmRPtIlJk/C8MgKHb0N3Gw9HNkQ8D1kjwI2Iqwwx2\nRzAx2VA3AgMBAAECggEACJ/zF8yqyUiBhM5RMYrd9Ofdg2cedTNrvwA5KGToKE9X\nFkJDpRlnGPRtMmicnSPE0UwKwy2CiHYFBfqKiqEoV1VQ351IkR5yRbpQsXzkyDks\nMOS4tj9kKNtj2h059OhIyes1ly76rG40+Z0lilL1ToxKZnc6QNoNjSawLIESfTpq\nzR+TEj/xZ/XMj14idZ/cCANghfPZZEQRhJx5GonZmmX2bBaIm66IxnimkVJH7vOD\nOZ0cWIF7HxwKksKKzonPH+tZlYXnr5tYMv7AWR+hLdlzFwM5gkKCcGUvBO21Hoim\ndoMTWBooVkSJvDQjNBMMpFgKl7OLDKilIIpRTvnCIQKBgQDvvCSSw/KhDIHqSrPs\nPfA6iiMQUlqrCO0cWUdx13M3Dg1yZmoo2a+nTagvFRdNUtX1LYtu03ETn5kM5HAA\nqyM5BC+7LdckjVkh+jGNgubftXBEnWy+66tiNqUnLDTonh+w3F19JWCPLmQxBKkl\nc3NYsY7Epg8UgyQRfSnB5qUWYQKBgQDDbrgmK4jH786nAPprmVD0sWX/J4ansz+T\no3/gW8aTCB3u16f+T6SyBBtTA/71LdzQz7hnyElYiyhaQubjGivlp6LR0xUetSQi\nii9Wq3c07dfDnGj3C3C71ZsOLSv3kQIiSXS5WRio1eJgMOUNZX4CoPdpH5Z/830u\nBE83uqQ9lwKBgH6G4RKo4nyHWmXqiW1s/0YWNA1gOcQ9UM9+e0ulN4TeINC5Jtxq\nj9+QB+zZh9PinVPqdsXGSM7fk+qPAmIH8O4dvIdg2UTMaTeakd6rMOjvHNLJ92QI\nhAqw5pd3KHGBSx6QH7N2L7FB/dU1LYS7myw7gitdrWXZFQc59PkGnyjhAoGAO05u\nM6ciawoq/CMf22c7WgY7naKxClMrB/Kl67/uEtBzxPdM06/3ms4EPL0Jsf2o9PUU\nUOpG18fjBwEmb+SRTbABiQs1bYwq2xB0LSj7k+RZhdMBR3cBTv8TfsnWfdpTe3Qv\nJ9AR26qMeARefiI+iy2t5wje8xVA96X3JEJPdSECgYEAslevSDK4fXM8CCNiipSM\no6wuuhqPrNeXxP7htxfRM210zQ0FeUbNVHCQY+yOJOZ1jnXUmiQTL0ZKzdY/GRjN\nqeBJUG7Z6R5NGNH/Phmpy6qcLADBpHiZhpWsUZ8iPQduNv2cOcRo/TSQ029wOVYo\n+Sg9ZKYAvpcQf9VYTeFgKoQ=\n-----END PRIVATE KEY-----\n"
      }),
      databaseURL: "https://servicevale-19ead.firebaseio.com",
    });

    // Get notification data
    const { description } = JSON.parse(req.body);

    // Get all admin devices
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("681b300f0018fdc27bdd")
      .setKey("standard_41aa4ffbc446ce25b803df803ae4a23cb300afb3a4e58573c1b3920aa3a8bdf8765aac8e3694dd2af92b2dff62727f12039835fd73588b33ff3a25c8b334156a16d0989d54820d7fafbbf34130bb6953694adce7a5285881faff09a5ba8490a02145b02954a3372a22a238b07b1a1069de05e96cb671ffc49180c332c94dec5c");

    const databases = new Databases(client);
    const tokens = await databases.listDocuments(
     "https://cloud.appwrite.io/console/project-fra-681b300f0018fdc27bdd/databases/database-681c428b00159abb5e8b/collection-notification_tokens",
      '684ab57c002abb8810a6'
    );

    // Send notifications
    const messages = tokens.documents.map(device => ({
      notification: {
        title: "New Alert!",
        body: description
      },
      token: device.token
    }));

    await admin.messaging().sendAll(messages);
    
    return res.json({ success: true });
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};