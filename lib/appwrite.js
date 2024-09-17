import { Client, Account, Avatars, Databases, Query, ID } from 'react-native-appwrite';

export const Config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.aora.danna',
    projectId:'66e89b2f0017988b7ba1',
    databasesId: '66e89e5b00031218dc72',
    userCollectionId:'66e89e8a003053dec3b1',
    videoCollectionId: '66e89ef000345396ad1c',
    storageId: '66e8a4cb00052ef2c944'
  
};
const client = new Client();

client
    .setEndpoint(Config.endpoint)
    .setProject(Config.projectId)
    .setPlatform(Config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) {
            throw new Error('Account creation failed');
        }

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            Config.databaseId,
            Config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        );

        return newUser;
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw new Error(error.message);
    }
};

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password);
        return session;
    } catch (error) {
        console.error('Error signing in:', error.message);
        throw new Error('Sign in failed: ' + error.message);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) {
            throw new Error('No current account found');
        }

        const currentUser = await databases.listDocuments(
            Config.databaseId,
            Config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (currentUser.documents.length === 0) {
            throw new Error('User not found');
        }

        return currentUser.documents[0];
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        throw new Error('Error fetching current user: ' + error.message);
    }
};