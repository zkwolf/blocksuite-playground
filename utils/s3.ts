import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { BlobStorage } from '@blocksuite/store';

export const createS3Storage = (): BlobStorage => {
  const config = {
    bucket: import.meta.env.VITE_BUCKET,
    endpoint: import.meta.env.VITE_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_ACCESSKEY,
      secretAccessKey: import.meta.env.VITE_SECRETKEY
    }
  }
  const client = new S3Client({ region: 'auto', ...config });
  const { bucket } = config
  return {
    crud: {
      get: async (key: string) => {
        try {
          const obj = await client.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: key,
            })
          );

          if (!obj.Body) {
            console.error(`Object \`${key}\` not found`);
            return null;
          }

          console.log(`Read object \`${key}\``);
          const u8Array = await obj.Body.transformToByteArray()
          return new Blob([u8Array], { type: obj.ContentType })
        } catch (e) {
          // 404
          if (e instanceof NoSuchKey) {
            console.error(`Object \`${key}\` not found`);
            return null;
          } else {
            throw new Error(`Failed to read object \`${key}\``, {
              cause: e,
            });
          }
        }
      },
      set: async (key: string, value: Blob) => {
        try {
          await client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: value,

              // metadata
              ContentType: value.type,
              ContentLength: value.size,
              // TODO: Cloudflare doesn't support CRC32, use md5 instead later.
              // ChecksumCRC32: metadata.checksumCRC32,
            })
          );

          console.log(`Object \`${key}\` put`);
          return key;
        } catch (e) {
          throw new Error(`Failed to put object \`${key}\``, {
            cause: e,
          });
        }
      },
      delete: async (key: string) => {
        try {
          await client.send(
            new DeleteObjectCommand({
              Bucket: bucket,
              Key: key,
            })
          );
        } catch (e) {
          throw new Error(`Failed to delete object \`${key}\``, {
            cause: e,
          });
        }
      },
      list: async () => {
        let continuationToken: any = undefined;
        let hasMore = true;
        let result: any[] = [];

        try {
          while (hasMore) {
            const listResult = await client.send(
              new ListObjectsV2Command({
                Bucket: bucket,
                ContinuationToken: continuationToken,
              })
            );

            if (listResult.Contents?.length) {
              result = result.concat(
                listResult.Contents.map(r => ({
                  key: r.Key!,
                  lastModified: r.LastModified!,
                  size: r.Size!,
                }))
              );
            }

            // has more items not listed
            hasMore = !!listResult.IsTruncated;
            continuationToken = listResult.NextContinuationToken;
          }

          console.log(`List ${result.length} objects`);
          return result;
        } catch (e) {
          throw new Error(`Failed to list objects`, {
            cause: e,
          });
        }
      },
    },
  };
};
