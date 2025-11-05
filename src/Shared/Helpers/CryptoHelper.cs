using System.Security.Cryptography;
using System.Text;

namespace ApiMarketplace.Shared.Helpers;

/// <summary>
/// Helper class for encrypting and decrypting sensitive data like API credentials
/// </summary>
public static class CryptoHelper
{
    /// <summary>
    /// Encrypts a plain text string using AES encryption
    /// </summary>
    /// <param name="plainText">The text to encrypt</param>
    /// <param name="key">The encryption key (will be padded/truncated to 32 bytes)</param>
    /// <returns>Base64 encoded encrypted string</returns>
    public static string Encrypt(string plainText, string key)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException(nameof(plainText));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentNullException(nameof(key));

        using var aes = Aes.Create();

        // Ensure key is exactly 32 bytes (256 bits)
        aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));

        // Generate a random IV for each encryption
        aes.GenerateIV();

        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

        using var msEncrypt = new MemoryStream();

        // Prepend IV to the encrypted data
        msEncrypt.Write(aes.IV, 0, aes.IV.Length);

        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        using (var swEncrypt = new StreamWriter(csEncrypt))
        {
            swEncrypt.Write(plainText);
        }

        return Convert.ToBase64String(msEncrypt.ToArray());
    }

    /// <summary>
    /// Decrypts an AES encrypted string
    /// </summary>
    /// <param name="cipherText">The Base64 encoded encrypted string</param>
    /// <param name="key">The encryption key (must match the key used for encryption)</param>
    /// <returns>Decrypted plain text</returns>
    public static string Decrypt(string cipherText, string key)
    {
        if (string.IsNullOrEmpty(cipherText))
            throw new ArgumentNullException(nameof(cipherText));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentNullException(nameof(key));

        var fullCipher = Convert.FromBase64String(cipherText);

        using var aes = Aes.Create();

        // Ensure key is exactly 32 bytes (256 bits)
        aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));

        // Extract IV from the beginning of the cipher text
        var iv = new byte[aes.IV.Length];
        Array.Copy(fullCipher, 0, iv, 0, iv.Length);
        aes.IV = iv;

        var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        using var msDecrypt = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
        using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
        using var srDecrypt = new StreamReader(csDecrypt);

        return srDecrypt.ReadToEnd();
    }

    /// <summary>
    /// Generates a cryptographically secure random encryption key
    /// </summary>
    /// <param name="length">Length of the key in bytes (default: 32 for AES-256)</param>
    /// <returns>Base64 encoded random key</returns>
    public static string GenerateKey(int length = 32)
    {
        var key = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(key);
        return Convert.ToBase64String(key);
    }
}
