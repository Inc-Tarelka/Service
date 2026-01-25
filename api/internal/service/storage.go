package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Inc-Tarelka/api/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// StorageService defines operations for object storage (S3-compatible)
// Minimal interface for our needs
type StorageService interface {
	// PresignPut generates a presigned PUT URL for uploading an object
	PresignPut(ctx context.Context, key, contentType string, ttl time.Duration) (string, map[string]string, error)
	// PresignGet generates a presigned GET URL for accessing a private object
	PresignGet(ctx context.Context, key string, ttl time.Duration) (string, error)
	// PublicURL builds a public URL for an object key (CDN or bucket endpoint)
	PublicURL(key string) string
	// HeadContentType returns the stored Content-Type for the object
	HeadContentType(ctx context.Context, key string) (string, error)
}

// s3Storage is an implementation using AWS SDK v2 against an S3-compatible endpoint
type s3Storage struct {
	client       *s3.Client
	presigner    *s3.PresignClient
	bucket       string
	endpoint     string
	usePathStyle bool
	cdnBaseURL   string
	publicDomain string
}

// NewS3Storage initializes an S3 client using custom endpoint and static credentials
func NewS3Storage(cfg *config.Config) (StorageService, error) {
	if cfg.S3Endpoint == "" || cfg.S3Region == "" || cfg.S3Bucket == "" || cfg.S3AccessKeyID == "" || cfg.S3SecretAccessKey == "" {
		return nil, fmt.Errorf("missing S3 configuration")
	}

	// Build custom AWS config
	resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		// Force our custom endpoint for S3 service
		if service == s3.ServiceID {
			return aws.Endpoint{
				URL:               fmt.Sprintf("https://%s", strings.TrimSpace(cfg.S3Endpoint)),
				HostnameImmutable: true,
			}, nil
		}
		return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested: %s", service)
	})

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(cfg.S3Region),
		awsconfig.WithEndpointResolverWithOptions(resolver),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.S3AccessKeyID, cfg.S3SecretAccessKey, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		// Path-style is often required for S3-compatible providers
		o.UsePathStyle = cfg.S3UsePathStyle
	})
	presigner := s3.NewPresignClient(client)

	return &s3Storage{
		client:       client,
		presigner:    presigner,
		bucket:       cfg.S3Bucket,
		endpoint:     cfg.S3Endpoint,
		usePathStyle: cfg.S3UsePathStyle,
		cdnBaseURL:   strings.TrimRight(cfg.CDNBaseURL, "/"),
		publicDomain: strings.TrimRight(cfg.S3PublicDomain, "/"),
	}, nil
}

func (s *s3Storage) PresignPut(ctx context.Context, key, contentType string, ttl time.Duration) (string, map[string]string, error) {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}
	res, err := s.presigner.PresignPutObject(ctx, input, func(opts *s3.PresignOptions) {
		opts.Expires = ttl
	})
	if err != nil {
		return "", nil, err
	}
	return res.URL, map[string]string{"Content-Type": contentType}, nil
}

func (s *s3Storage) PresignGet(ctx context.Context, key string, ttl time.Duration) (string, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}
	res, err := s.presigner.PresignGetObject(ctx, input, func(opts *s3.PresignOptions) {
		opts.Expires = ttl
	})
	if err != nil {
		return "", err
	}
	return res.URL, nil
}

func (s *s3Storage) PublicURL(key string) string {
	// Prefer explicit public domain if provided (Selectel public bucket domain or links bucket)
	if s.publicDomain != "" {
		// Ensure https scheme not duplicated; assume value is a full domain without scheme or with
		if strings.HasPrefix(s.publicDomain, "http://") || strings.HasPrefix(s.publicDomain, "https://") {
			return s.publicDomain + "/" + key
		}
		return "https://" + s.publicDomain + "/" + key
	}
	if s.cdnBaseURL != "" {
		return s.cdnBaseURL + "/" + key
	}
	// fallback to bucket endpoint URL
	if s.usePathStyle {
		// https://endpoint/bucket/key
		return fmt.Sprintf("https://%s/%s/%s", s.endpoint, s.bucket, key)
	}
	// virtual-host style: https://bucket.endpoint/key
	return fmt.Sprintf("https://%s.%s/%s", s.bucket, s.endpoint, key)
}

func (s *s3Storage) HeadContentType(ctx context.Context, key string) (string, error) {
	out, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", err
	}
	if out.ContentType == nil {
		return "", nil
	}
	return *out.ContentType, nil
}
