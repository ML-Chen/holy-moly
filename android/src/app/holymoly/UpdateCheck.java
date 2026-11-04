package app.holymoly;

import android.util.Base64;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;

/**
 * The security check for game updates.
 *
 * Every published build comes with a small manifest (version, SHA-256 and size of index.html) and a signature over
 * that manifest, made with the project's private update key (ECDSA P-256). Only the matching PUBLIC key is compiled
 * into the app, below. So a file is installed only if it was signed with the private key, which lives only in the
 * GitHub Actions secret HOLYMOLY_UPDATE_KEY and never in the repository.
 *
 * The public key is not written in this file either. The placeholder below is replaced by android/build.sh while the
 * APK is built: it derives the public key from the HOLYMOLY_UPDATE_KEY secret, so the owner never has to copy a key
 * into the repository, and the APK and the update signatures can't get out of step.
 *
 * That means nobody can push code to phones by opening a pull request, pushing a branch, forking the repository,
 * or tampering with a download on the way: an unsigned or altered file fails this check and is thrown away.
 */
final class UpdateCheck {
    private UpdateCheck() { }

    /** Public half of the update-signing key (X.509 SubjectPublicKeyInfo, base64), filled in by android/build.sh. */
    static final String UPDATE_PUBLIC_KEY_B64 = "@@UPDATE_PUBKEY_B64@@";

    /** The game page is about 2 MB; anything far larger is refused before downloading. */
    static final long MAX_GAME_BYTES = 40L * 1024 * 1024;

    static final class Manifest {
        long version;
        String sha256;
        long size;
    }

    /** Checks the signature, then the manifest's fields. Throws if anything is wrong. */
    static Manifest verifyManifest(byte[] manifestBytes, byte[] signatureDer) throws Exception {
        if (UPDATE_PUBLIC_KEY_B64.startsWith("@@")) throw new SecurityException("no update key compiled in");
        PublicKey key = KeyFactory.getInstance("EC").generatePublic(
            new X509EncodedKeySpec(Base64.decode(UPDATE_PUBLIC_KEY_B64, Base64.DEFAULT)));
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(key);
        verifier.update(manifestBytes);
        if (!verifier.verify(signatureDer)) throw new SecurityException("bad update signature");

        JSONObject json = new JSONObject(new String(manifestBytes, StandardCharsets.UTF_8));
        if (!"holymoly".equals(json.getString("app"))) throw new SecurityException("wrong app");
        if (!"index.html".equals(json.getString("file"))) throw new SecurityException("wrong file");
        Manifest manifest = new Manifest();
        manifest.version = json.getLong("version");
        manifest.sha256 = json.getString("sha256").toLowerCase();
        manifest.size = json.getLong("size");
        if (manifest.size <= 0 || manifest.size > MAX_GAME_BYTES) throw new SecurityException("bad size");
        if (!manifest.sha256.matches("[0-9a-f]{64}")) throw new SecurityException("bad hash");
        return manifest;
    }

    /** manifest.sig holds the DER signature as base64 text. */
    static byte[] decodeSignature(byte[] sigFileBytes) {
        return Base64.decode(new String(sigFileBytes, StandardCharsets.US_ASCII).trim(), Base64.DEFAULT);
    }

    static String sha256Hex(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new FileInputStream(file)) {
            byte[] buffer = new byte[65536];
            for (int n; (n = in.read(buffer)) > 0; ) digest.update(buffer, 0, n);
        }
        StringBuilder hex = new StringBuilder();
        for (byte b : digest.digest()) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
