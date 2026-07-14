export interface JourneyProgress {
  journey_id: string;
  customer_id: string;
  journey_type: "credit_application" | "credit_card_application" | "membership_application";
  current_step: string;
  step_order: number;
  status:
    | "started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected"
    | "abandoned";
  form_data: Record<string, any>;
  started_at: string;
  updated_at: string;
  completed_at?: string;
  source_platform: "web" | "mobile_web";
  last_platform: "web" | "mobile_web";
  
  // Cross-device and installation tracking
  last_device_key: string;
  last_activity_at: string;
}
