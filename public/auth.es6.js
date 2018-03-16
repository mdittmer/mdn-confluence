const uiConfig = {
  callbacks: {signInSuccess: () => false},
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
};
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
    document.querySelector('#firebaseui-auth-container').style.display = 'block';
  } else {
    document.querySelector('#firebaseui-auth-container').style.display = 'none';
  }
});
