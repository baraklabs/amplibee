/**
 * Hand-authored to match supabase/migrations/0001_init.sql through
 * 0010_cross_posting.sql exactly. If you add a Supabase CLI to this
 * project later, replace this file with `supabase gen types typescript` output.
 */

export type ChannelId = "x" | "linkedin" | "youtube" | "instagram" | "facebook";
export type AIProviderIdDb = "openai" | "anthropic" | "openrouter" | "custom";
export type ContentLength = "short" | "medium" | "long";
export type Formality = "casual" | "neutral" | "formal";
export type AccountType = "profile" | "page" | "channel";
export type ConnectionStatus = "connected" | "expired" | "revoked" | "error";
export type InputType = "x_post" | "text" | "url" | "github_repo" | "product_hunt" | "blog_post";
export type GeneratedPostStatus = "draft" | "scheduled" | "published" | "failed";
export type ScheduledPostStatus = "pending" | "sent" | "failed" | "canceled";

/** @deprecated kept as an alias — most of the codebase still says "platform" for a channel. */
export type PlatformIdDb = ChannelId;

export interface NotificationPreferences {
  scheduled_post_published: boolean;
  workflow_failed: boolean;
  weekly_summary: boolean;
}

interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      // bigint id, but represented as `string` here — every call site gets it as a string
      // already (the JWT `sub` claim, and Postgrest doesn't care about the exact numeric
      // type for query building), and `string` avoids bigint precision loss in JS `number`.
      users: Table<
        {
          id: string;
          email_id: string;
          password_hash: string | null;
          otp: string | null;
          otp_expires_at: string | null;
          otp_attempts: number;
          verification_token_hash: string | null;
          first_name: string | null;
          last_name: string | null;
          verified: boolean;
          active: boolean;
          created_at: string;
        },
        never,
        Partial<{
          password_hash: string | null;
          otp: string | null;
          otp_expires_at: string | null;
          otp_attempts: number;
          verification_token_hash: string | null;
          first_name: string | null;
          last_name: string | null;
          verified: boolean;
          active: boolean;
        }>
      >;
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          company_name: string | null;
          website_url: string | null;
          avatar_url: string | null;
          onboarded_at: string | null;
          notification_preferences: NotificationPreferences;
          created_at: string;
          updated_at: string;
        },
        { id: string; full_name?: string | null; company_name?: string | null; website_url?: string | null; avatar_url?: string | null; onboarded_at?: string | null; notification_preferences?: NotificationPreferences },
        Partial<{ full_name: string | null; company_name: string | null; website_url: string | null; avatar_url: string | null; onboarded_at: string | null; notification_preferences: NotificationPreferences }>
      >;
      content_profiles: Table<
        {
          id: string;
          user_id: string;
          name: string;
          tone: string;
          audience: string;
          brand_voice: string;
          length: ContentLength;
          formality: Formality;
          cta_style: string;
          topics_to_avoid: string;
          words_to_avoid: string;
          personal_context: string;
          default_hashtags: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          name: string;
          tone?: string;
          audience?: string;
          brand_voice?: string;
          length?: ContentLength;
          formality?: Formality;
          cta_style?: string;
          topics_to_avoid?: string;
          words_to_avoid?: string;
          personal_context?: string;
          default_hashtags?: string;
          is_default?: boolean;
        },
        Partial<{
          name: string;
          tone: string;
          audience: string;
          brand_voice: string;
          length: ContentLength;
          formality: Formality;
          cta_style: string;
          topics_to_avoid: string;
          words_to_avoid: string;
          personal_context: string;
          default_hashtags: string;
          is_default: boolean;
        }>
      >;
      ai_providers: Table<
        {
          id: string;
          user_id: string;
          provider: AIProviderIdDb;
          label: string | null;
          base_url: string | null;
          encrypted_api_key: string;
          default_model: string;
          is_default: boolean;
          last_tested_at: string | null;
          last_test_status: "success" | "failed" | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          provider: AIProviderIdDb;
          label?: string | null;
          base_url?: string | null;
          encrypted_api_key: string;
          default_model: string;
          is_default?: boolean;
          last_tested_at?: string | null;
          last_test_status?: "success" | "failed" | null;
        },
        Partial<{
          label: string | null;
          base_url: string | null;
          encrypted_api_key: string;
          default_model: string;
          is_default: boolean;
          last_tested_at: string | null;
          last_test_status: "success" | "failed" | null;
        }>
      >;
      connected_accounts: Table<
        {
          id: string;
          user_id: string;
          platform: ChannelId;
          account_type: AccountType;
          external_account_id: string | null;
          display_name: string;
          handle: string | null;
          avatar_url: string | null;
          encrypted_access_token: string | null;
          encrypted_refresh_token: string | null;
          token_expires_at: string | null;
          status: ConnectionStatus;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          platform: ChannelId;
          account_type?: AccountType;
          external_account_id?: string | null;
          display_name: string;
          handle?: string | null;
          avatar_url?: string | null;
          encrypted_access_token?: string | null;
          encrypted_refresh_token?: string | null;
          token_expires_at?: string | null;
          status?: ConnectionStatus;
          last_synced_at?: string | null;
        },
        Partial<{
          display_name: string;
          handle: string | null;
          avatar_url: string | null;
          encrypted_access_token: string | null;
          encrypted_refresh_token: string | null;
          token_expires_at: string | null;
          status: ConnectionStatus;
          last_synced_at: string | null;
        }>
      >;
      source_posts: Table<
        {
          id: string;
          user_id: string;
          input_type: InputType;
          source_account_id: string | null;
          title: string | null;
          raw_content: string;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          input_type: InputType;
          source_account_id?: string | null;
          title?: string | null;
          raw_content: string;
          source_url?: string | null;
        },
        never
      >;
      generated_posts: Table<
        {
          id: string;
          user_id: string;
          source_post_id: string | null;
          platform: ChannelId;
          account_id: string | null;
          content_profile_id: string | null;
          content: string;
          status: GeneratedPostStatus;
          ai_provider: string | null;
          ai_model: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          source_post_id?: string | null;
          platform: ChannelId;
          account_id?: string | null;
          content_profile_id?: string | null;
          content: string;
          status?: GeneratedPostStatus;
          ai_provider?: string | null;
          ai_model?: string | null;
        },
        Partial<{
          account_id: string | null;
          content: string;
          status: GeneratedPostStatus;
        }>
      >;
      scheduled_posts: Table<
        {
          id: string;
          user_id: string;
          generated_post_id: string;
          account_id: string;
          scheduled_for: string;
          status: ScheduledPostStatus;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          generated_post_id: string;
          account_id: string;
          scheduled_for: string;
          status?: ScheduledPostStatus;
        },
        Partial<{ status: ScheduledPostStatus; error_message: string | null }>
      >;
      published_posts: Table<
        {
          id: string;
          user_id: string;
          generated_post_id: string;
          account_id: string;
          external_id: string | null;
          external_url: string | null;
          published_at: string;
          created_at: string;
        },
        {
          user_id: string;
          generated_post_id: string;
          account_id: string;
          external_id?: string | null;
          external_url?: string | null;
        },
        never
      >;
      analytics: Table<
        {
          id: string;
          user_id: string;
          published_post_id: string;
          impressions: number;
          engagements: number;
          clicks: number;
          captured_at: string;
          created_at: string;
        },
        {
          user_id: string;
          published_post_id: string;
          impressions?: number;
          engagements?: number;
          clicks?: number;
          captured_at?: string;
        },
        never
      >;
      backlinks: Table<
        {
          id: string;
          user_id: string;
          generated_post_id: string | null;
          canonical_url: string;
          destination_url: string;
          anchor_text: string;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          cta_text: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          generated_post_id?: string | null;
          canonical_url: string;
          destination_url: string;
          anchor_text: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          cta_text?: string | null;
        },
        never
      >;
      newsletter_subscribers: Table<
        { id: string; email: string; created_at: string },
        { email: string },
        never
      >;
      contact_messages: Table<
        { id: string; name: string; email: string; message: string; created_at: string },
        { name: string; email: string; message: string },
        never
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
