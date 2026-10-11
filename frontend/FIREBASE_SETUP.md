# Firebase setup for the POS

This standalone POS uses Firebase Authentication, Cloud Firestore, and Firebase Storage. Its Firebase web configuration is initialized in [src/firebase.js](./src/firebase.js) using the project configuration supplied for this POS.

## Enable Firebase services

1. In the Firebase console for project `adminbistro-97eed`, enable **Authentication → Sign-in method → Email/Password**.
2. Create an administrator account in **Authentication → Users**. Public sign-up is not implemented.
3. Enable **Cloud Firestore** and **Storage** for the project.
4. Copy the new user's UID from Authentication. In Firestore, create a document at `admins/{UID}` with the string field `role` set to `admin`. The website cannot create or edit administrator records.
5. Publish the repository's `firestore.rules` and `storage.rules` in the respective Firebase console rules editors.

The `admins/{UID}` record is checked by the UI and by both security rulesets. Do not replace these rules with unrestricted authenticated-user access.

## Data and app scope

The POS reads and writes categories, products, cake options, toppings, gallery items, promotions, orders, expenses, and store settings in Firestore. Uploaded images go to Firebase Storage and are restricted to signed-in admin users.

This POS is standalone and does not connect to a separate customer app or REST backend. Existing MongoDB records, if any, are not copied automatically.

The frontend loads Firebase 13 browser SDK modules from Google's `gstatic.com` CDN. A browser connection to that CDN is required; no npm Firebase package installation is needed.
