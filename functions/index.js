// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Set user role after creation
exports.setUserRole = functions.https.onCall(async (data, context) => {
  const { uid, role, status } = data;
  
  const validRoles = ['student', 'coordinator', 'employer'];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
  }
  
  const claims = {
    role: role,
    ...(role === 'student' && { status: status || 'applied' })
  };
  
  await admin.auth().setCustomUserClaims(uid, claims);
  return { success: true };
});

// Update student status
exports.updateStudentStatus = functions.https.onCall(async (data, context) => {
  const { uid, status } = data;
  
  const validStatuses = [
    'applied', 
    'provisionally_accepted', 
    'provisionally_rejected', 
    'final_rejected', 
    'final_accepted'
  ];
  
  if (!validStatuses.includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid status');
  }
  
  const user = await admin.auth().getUser(uid);
  const currentClaims = user.customClaims || {};
  
  await admin.auth().setCustomUserClaims(uid, {
    ...currentClaims,
    status: status
  });
  
  return { success: true };
});