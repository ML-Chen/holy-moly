# Holy Moly! on Android: one-time setup and releases

This page is for the owner of the GitHub repository ML-Chen/holy-moly. It explains how to set up the keys once, how to get an installable Android app (an APK) out of GitHub, and how to put it on a phone. You don't need Android Studio or the Android SDK on your computer. GitHub builds the app on its own servers.

## What you will make

You make two keys on your own computer and store them as three GitHub secrets:

| Secret name | What it is |
|---|---|
| `HOLYMOLY_UPDATE_KEY` | The private key that signs game updates. Installed apps only accept new game builds signed with it. |
| `HOLYMOLY_KEYSTORE_B64` | The Android release keystore, turned into text (base64). Android uses it to check that a new APK comes from the same author as the installed one. |
| `HOLYMOLY_KEYSTORE_PASSWORD` | The password you chose for that keystore. |

You never put a public key into the repository. The app build works out the public half of the update key from `HOLYMOLY_UPDATE_KEY` by itself and builds it into the app.

## Step 1: make the update key

You need `openssl`. It is already installed on macOS and Linux. On Windows, use the "Git Bash" window that comes with Git for Windows.

Open a terminal in a folder that is NOT inside the repository (your home folder is fine) and run:

```
openssl ecparam -name prime256v1 -genkey -noout | openssl pkcs8 -topk8 -nocrypt -out holymoly_update_key.pem
```

This creates the file `holymoly_update_key.pem`. It starts with `-----BEGIN PRIVATE KEY-----`. The whole file, including the BEGIN and END lines, goes into the secret `HOLYMOLY_UPDATE_KEY`.

## Step 2: make the release keystore

You need `keytool`, which comes with Java. If `keytool -help` says the command is not found, install a Java JDK first (for example Temurin 17 from adoptium.net, or `brew install openjdk@17` on a Mac).

```
keytool -genkeypair -v -keystore holymoly-release.jks -alias holymoly -keyalg RSA -keysize 4096 -validity 10000
```

It asks for a password (at least 6 characters; write it down), then your name and some optional details, which you can fill in or leave blank, then asks you to confirm with `yes`. If it asks for a separate key password, press Enter so the key uses the same password as the keystore. The build expects one password for both.

The key inside the keystore is called `holymoly` (that is the "alias"). The build looks for exactly that name.

Then turn the keystore into text for GitHub:

- Linux or Git Bash: `base64 -w0 holymoly-release.jks > holymoly-release.b64.txt`
- macOS: `base64 -i holymoly-release.jks -o holymoly-release.b64.txt`

The contents of `holymoly-release.b64.txt` go into `HOLYMOLY_KEYSTORE_B64`. Line breaks in it don't matter; the build removes them.

## Step 3: add the three secrets to GitHub

In a web browser, open https://github.com/ML-Chen/holy-moly and go to **Settings → Secrets and variables → Actions → New repository secret**. Add each one:

1. Name `HOLYMOLY_UPDATE_KEY`. Value: open `holymoly_update_key.pem` in a text editor, copy everything, paste.
2. Name `HOLYMOLY_KEYSTORE_B64`. Value: copy everything in `holymoly-release.b64.txt`, paste.
3. Name `HOLYMOLY_KEYSTORE_PASSWORD`. Value: the keystore password from step 2.

If you have the GitHub command-line tool (`gh`) and are logged in, these three commands do the same without copying and pasting (the last one asks you to type the password):

```
gh secret set HOLYMOLY_UPDATE_KEY -R ML-Chen/holy-moly < holymoly_update_key.pem
gh secret set HOLYMOLY_KEYSTORE_B64 -R ML-Chen/holy-moly < holymoly-release.b64.txt
gh secret set HOLYMOLY_KEYSTORE_PASSWORD -R ML-Chen/holy-moly
```

After that you can delete `holymoly-release.b64.txt`. Keep the other two files (see "Back up your keys" below).

## Step 4: turn on the web version (GitHub Pages)

Each push to `main` that changes the game runs the workflow "Publish game and signed app update". It builds the game and puts it on a branch called `gh-pages`, together with the signed update that installed apps download. To start it the first time without pushing anything, go to **Actions → Publish game and signed app update → Run workflow**.

When that run has finished, go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **gh-pages**, folder **/ (root)**, and click Save. A minute later the game is playable at https://ml-chen.github.io/holy-moly/.

If the update key secret is missing, this workflow still publishes the playable web game, shows a yellow warning, and leaves out the `update/` folder, so installed apps simply don't get that build.

## Step 5: build the Android app

There are two ways to start a build. Only people with write access to the repository can do either.

- **From the website:** go to **Actions → Build Android APK → Run workflow**. Leave the "release" box empty to just build. Type a name such as `android-v1.0` in it to also publish a GitHub Release with the app attached.
- **With a tag from your computer:** `git tag android-v1.0` and then `git push origin android-v1.0`. Any tag that starts with `android-v` builds the app and publishes a Release with that name.

The build takes a few minutes. If a secret is missing, the run stops with a red error that names the missing secret.

Where the app ends up:

- **Every build:** open the run under Actions and scroll to "Artifacts". `holymoly-apk` is a zip file with `holymoly.apk` and its SHA-256 checksum inside. You must be logged in to GitHub to download it, and the files are deleted after 90 days.
- **Release builds:** the repository's **Releases** page (https://github.com/ML-Chen/holy-moly/releases) has `holymoly.apk` attached to the release. This link works on a phone without logging in, so use releases for anything you install on a family phone.

## Step 6: install it on a phone

1. On the Android phone, open the Releases page in the browser and tap `holymoly.apk` to download it.
2. Tap the downloaded file. The first time, Android says the browser isn't allowed to install apps. Tap **Settings**, turn on **Allow from this source**, and go back.
3. Tap **Install**. Google Play Protect may say it doesn't recognise the developer. Tap **More details → Install anyway**. This is normal for apps that don't come from the Play Store.
4. Open **Holy Moly!** from the home screen. It plays without an internet connection.

To install a newer APK later, do the same steps. Android installs it over the old one and the saved progress (cards, best scores) stays. This only works if the new APK was signed with the same keystore.

## How game updates reach the phone

You don't need a new APK when you change the game. When the app is open and online, it checks GitHub at most every 3 hours for a newer signed build, downloads it, checks its signature and SHA-256 checksum, and starts using it the next time the app is opened. A new APK is only needed when something in the `android/` folder changes.

## Back up your keys

Store `holymoly_update_key.pem`, `holymoly-release.jks` and the keystore password in a safe place outside the repository, for example a password manager plus an encrypted USB stick. GitHub never shows a secret's value again after you save it, so the GitHub secret is not a backup.

- **If you lose the keystore or its password,** you can't make an APK that installs over the existing app. Every phone would have to uninstall Holy Moly! (which deletes its saved progress) and install a new app signed with a new keystore.
- **If you lose the update key,** installed apps stop receiving game updates. You can make a new update key and put it in `HOLYMOLY_UPDATE_KEY`, but each phone then needs a newly built APK, because the old app only trusts the old key.
- **If someone else gets the update key,** they could sign a game build that installed apps would accept if they could also get it onto the `gh-pages` branch. If you think it leaked, make a new one, replace the secret, and build and install a new APK.

Never commit any of these files to the repository, and never paste them into an issue, a pull request or a chat.
