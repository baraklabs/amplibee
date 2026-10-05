/**
 * Hand-authored to match supabase/migrations/0001_init.sql through
 * 0009_influencer_marketplace.sql exactly. If you add a Supabase CLI to this
 * project later, replace this file with `supabase gen types typescript` output.
 */

export type ChannelId = "x" | "linkedin" | "youtube" | "instagram";
export type AIProviderIdDb = "openai" | "anthropic" | "openrouter" | "custom";
export type NetworkCategory = "influencer" | "creator" | "community";
export type ContentLength = "short" | "medium" | "long";
export type Formality = "casual" | "neutral" | "formal";
export type PromotionType =
  | "github_repo"
  | "saas_product"
  | "mobile_app"
  | "product_hunt_launch"
  | "blog_post"
  | "other";
export type CampaignGoal = "stars" | "signups" | "downloads" | "awareness" | "traffic";
export type BudgetType = "unpaid" | "paid" | "gifted";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignBriefStatus = "draft" | "approved";
export type ApplicationStatus = "pending" | "accepted" | "declined";
export type DeliverableStatus = "submitted" | "approved" | "rejected";

export type PlatformIdDb = "x" | "linkedin" | "medium" | "substack";
export type AccountType = "profile" | "page" | "publication";
export type ConnectionStatus = "connected" | "expired" | "revoked" | "error";
export type InputType = "x_post" | "text" | "url" | "github_repo" | "product_hunt" | "blog_post";
export type ApprovalMode = "manual" | "automatic";
export type PublishMode = "immediate" | "schedule" | "draft";
export type WorkflowStepType = "generate" | "approval" | "publish";
export type GeneratedPostStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";
export type ScheduledPostStatus = "pending" | "sent" | "failed" | "canceled";

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
      platforms: Table<
        {
          id: string;
          name: string;
          auth_type: "oauth2" | "api_token" | "manual";
          color: string;
          capabilities: Record<string, boolean>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        never,
        never
      >;
      connected_accounts: Table<
        {
          id: string;
          user_id: string;
          platform: PlatformIdDb;
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
          platform: PlatformIdDb;
          account_type: AccountType;
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
      workflows: Table<
        {
          id: string;
          user_id: string;
          name: string;
          source_type: InputType;
          source_account_id: string | null;
          content_profile_id: string | null;
          approval_mode: ApprovalMode;
          publish_mode: PublishMode;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          name: string;
          source_type: InputType;
          source_account_id?: string | null;
          content_profile_id?: string | null;
          approval_mode?: ApprovalMode;
          publish_mode?: PublishMode;
          is_active?: boolean;
        },
        Partial<{
          name: string;
          source_type: InputType;
          source_account_id: string | null;
          content_profile_id: string | null;
          approval_mode: ApprovalMode;
          publish_mode: PublishMode;
          is_active: boolean;
        }>
      >;
      workflow_steps: Table<
        {
          id: string;
          workflow_id: string;
          position: number;
          step_type: WorkflowStepType;
          target_platform: PlatformIdDb | null;
          target_account_id: string | null;
          config: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        },
        {
          workflow_id: string;
          position: number;
          step_type: WorkflowStepType;
          target_platform?: PlatformIdDb | null;
          target_account_id?: string | null;
          config?: Record<string, unknown>;
        },
        Partial<{
          position: number;
          step_type: WorkflowStepType;
          target_platform: PlatformIdDb | null;
          target_account_id: string | null;
          config: Record<string, unknown>;
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
        Partial<{ title: string | null; raw_content: string; source_url: string | null }>
      >;
      generated_posts: Table<
        {
          id: string;
          user_id: string;
          source_post_id: string | null;
          workflow_id: string | null;
          platform: PlatformIdDb;
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
          workflow_id?: string | null;
          platform: PlatformIdDb;
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
          ai_provider: string | null;
          ai_model: string | null;
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
          error_message?: string | null;
        },
        Partial<{ scheduled_for: string; status: ScheduledPostStatus; error_message: string | null }>
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
          published_at?: string;
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
        Partial<{
          canonical_url: string;
          destination_url: string;
          anchor_text: string;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          cta_text: string | null;
        }>
      >;
      campaigns: Table<
        {
          id: string;
          user_id: string;
          name: string;
          promotion_type: PromotionType;
          product_url: string | null;
          repo_url: string | null;
          goal: CampaignGoal;
          brief: string;
          content_profile_id: string | null;
          target_channels: ChannelId[];
          budget_type: BudgetType;
          status: CampaignStatus;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          name: string;
          promotion_type?: PromotionType;
          product_url?: string | null;
          repo_url?: string | null;
          goal?: CampaignGoal;
          brief?: string;
          content_profile_id?: string | null;
          target_channels?: ChannelId[];
          budget_type?: BudgetType;
          status?: CampaignStatus;
          is_public?: boolean;
        },
        Partial<{
          name: string;
          promotion_type: PromotionType;
          product_url: string | null;
          repo_url: string | null;
          goal: CampaignGoal;
          brief: string;
          content_profile_id: string | null;
          target_channels: ChannelId[];
          budget_type: BudgetType;
          status: CampaignStatus;
          is_public: boolean;
        }>
      >;
      campaign_briefs: Table<
        {
          id: string;
          campaign_id: string;
          channel: ChannelId;
          content: string;
          status: CampaignBriefStatus;
          ai_provider: string | null;
          ai_model: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          campaign_id: string;
          channel: ChannelId;
          content: string;
          status?: CampaignBriefStatus;
          ai_provider?: string | null;
          ai_model?: string | null;
        },
        Partial<{ content: string; status: CampaignBriefStatus; ai_provider: string | null; ai_model: string | null }>
      >;
      campaign_links: Table<
        {
          id: string;
          campaign_id: string;
          destination_url: string;
          tracked_url: string;
          suggested_cta: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          campaign_id: string;
          destination_url: string;
          tracked_url: string;
          suggested_cta?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
        },
        Partial<{
          destination_url: string;
          tracked_url: string;
          suggested_cta: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
        }>
      >;
      campaign_applications: Table<
        {
          id: string;
          campaign_id: string;
          network_profile_id: string;
          channel: ChannelId;
          message: string | null;
          status: ApplicationStatus;
          created_at: string;
          updated_at: string;
        },
        {
          campaign_id: string;
          network_profile_id: string;
          channel: ChannelId;
          message?: string | null;
          status?: ApplicationStatus;
        },
        Partial<{ status: ApplicationStatus; message: string | null }>
      >;
      campaign_deliverables: Table<
        {
          id: string;
          campaign_id: string;
          application_id: string | null;
          network_profile_id: string;
          channel: ChannelId;
          content_url: string;
          notes: string | null;
          status: DeliverableStatus;
          submitted_at: string;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          campaign_id: string;
          application_id?: string | null;
          network_profile_id: string;
          channel: ChannelId;
          content_url: string;
          notes?: string | null;
          status?: DeliverableStatus;
        },
        Partial<{ status: DeliverableStatus; notes: string | null; reviewed_at: string | null }>
      >;
      campaign_metrics: Table<
        {
          id: string;
          deliverable_id: string;
          impressions: number;
          engagements: number;
          clicks: number;
          captured_at: string;
          created_at: string;
        },
        {
          deliverable_id: string;
          impressions?: number;
          engagements?: number;
          clicks?: number;
          captured_at?: string;
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
      network_profiles: Table<
        {
          id: string;
          user_id: string | null;
          display_name: string;
          category: NetworkCategory;
          platforms: string[];
          niches: string[];
          rate_info: string | null;
          portfolio_url: string | null;
          audience_size: number | null;
          bio: string | null;
          contact_url: string | null;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id?: string | null;
          display_name: string;
          category: NetworkCategory;
          platforms?: string[];
          niches?: string[];
          rate_info?: string | null;
          portfolio_url?: string | null;
          audience_size?: number | null;
          bio?: string | null;
          contact_url?: string | null;
          is_visible?: boolean;
        },
        Partial<{
          display_name: string;
          category: NetworkCategory;
          platforms: string[];
          niches: string[];
          rate_info: string | null;
          portfolio_url: string | null;
          audience_size: number | null;
          bio: string | null;
          contact_url: string | null;
          is_visible: boolean;
        }>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
