export interface FeaturedImage {
  ID: number;
  id: number;
  title: string;
  filename: string;
  filesize: number;
  url: string;
  link: string;
  alt: string;
  author: string;
  description: string;
  caption: string;
  name: string;
  status: string;
  uploaded_to: number;
  date: string;
  modified: string;
  menu_order: number;
  mime_type: string;
  type: string;
  subtype: string;
  icon: string;
  width: number;
  height: number;
  sizes: {
    [key: string]: string | number;
  };
}

export interface CategoryOption {
  short_description: string;
  long_description: string;
  minimum_cost: string;
  maximum_cost: string;
  featured_image: FeaturedImage;
}

export interface FormFields {
  form_headline: string;
  form_description: string;
  form_footer_text: string;
}

export interface Question {
  question_text: string;
  question_help_text: string;
  option: CategoryOption[];
}

export interface CalculatorData {
  calculator_id: number;
  calculator_title: string;
  calculator_slug: string;
  calculator_url: string;
  form_fields: FormFields;
  questions: Question[];
  last_modified: string;
  post_type: string;
}

export interface WordPressApiResponse {
  success: boolean;
  data: CalculatorData;
  timestamp: number;
}

// Legacy interfaces for backward compatibility with existing components
export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  detailContent: string;
}

export interface HomePageData {
  headline: string;
  helpText: string;
  categories: Category[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
