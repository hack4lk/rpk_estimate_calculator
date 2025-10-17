import axios from "axios";
import { HomePageData, Category, WordPressApiResponse, CalculatorData } from "../types";
import { configService } from "./config";
import { axiosInstance, AxiosResponse, AxiosError } from "./httpClient";

// Get configuration
const API_CONFIG = configService.getConfig();

// Category slug mapping
const CATEGORY_SLUGS: { [key: string]: string } = {
  'kitchens': 'calculator-kitchens',
  'bathrooms': 'calculator-bathrooms', 
  'basements': 'calculator-basements',
  'windows': 'calculator-windows',
  'flooring': 'calculator-flooring',
  'home-renovations': 'calculator-renovations',
  'structural': 'calculator-structural'
};

// Log configuration on startup (useful for debugging)
if (API_CONFIG.environment === "development") {
  configService.logConfiguration();
}

/**
 * Transform WordPress API response to the format expected by components
 */
const transformWordPressResponse = (wpResponse: WordPressApiResponse): HomePageData => {
  const calculatorData = wpResponse.data;
  
  // Get the first question which contains the category options
  const homeQuestion = calculatorData.questions[0];
  if (!homeQuestion || !homeQuestion.option) {
    throw new Error("Invalid API response: No categories found");
  }

  // Transform WordPress categories to our Category interface
  const categories: Category[] = homeQuestion.option.map((option) => ({
    id: createCategoryId(option.short_description),
    title: option.short_description,
    description: option.long_description || `Professional ${option.short_description.toLowerCase()} estimates`,
    image: option.featured_image.url,
    detailContent: generateDetailContent(option.short_description, option.long_description)
  }));

  return {
    headline: homeQuestion.question_text || `${calculatorData.calculator_title} - Professional Estimate Calculator`,
    helpText: homeQuestion.question_help_text || "Select a category below to get started with your construction estimate",
    categories
  };
};

/**
 * Create a URL-friendly category ID from the title
 */
const createCategoryId = (title: string): string => {
  return title.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

/**
 * Generate detailed content for categories
 */
const generateDetailContent = (title: string, longDescription: string): string => {
  if (longDescription && longDescription.trim()) {
    return longDescription;
  }

  // Generate default content based on category
  const defaultContent: { [key: string]: string } = {
    'kitchens': 'Transform your kitchen with our comprehensive renovation estimates. We cover everything from cabinet installation and countertops to appliances, lighting, plumbing, and electrical work. Our detailed estimates include material costs, labor, permits, and timeline projections for your dream kitchen.',
    'bathrooms': 'Upgrade your bathroom with professional renovation estimates. From small powder rooms to luxury master suites, we provide detailed cost breakdowns for fixtures, tile work, plumbing, electrical, ventilation, and all finishing touches to create your perfect bathroom space.',
    'basements': 'Maximize your home\'s potential with basement finishing estimates. We cover waterproofing, insulation, framing, drywall, flooring, electrical, plumbing, and HVAC systems to transform your basement into valuable living space.',
    'windows': 'Improve your home\'s energy efficiency and curb appeal with new windows. Our estimates cover window selection, removal of old windows, installation of energy-efficient replacements, trim work, and weatherproofing.',
    'flooring': 'Update your home with beautiful new flooring. We provide estimates for hardwood, laminate, tile, carpet, luxury vinyl, and more. Our comprehensive quotes include material costs, subfloor preparation, installation, and finishing touches.',
    'home renovations': 'Transform your entire home with comprehensive renovation estimates. From room additions and open floor plans to whole-house updates, we provide detailed project management and phased construction timelines.',
    'structural': 'Ensure your home\'s structural integrity with professional estimates for foundation work, beam installation, wall removal, structural repairs, and load-bearing modifications. Our estimates include engineering consultations and permits.'
  };

  const categoryKey = title.toLowerCase();
  return defaultContent[categoryKey] || `Professional ${title.toLowerCase()} estimates tailored to your project needs.`;
};

/**
 * Fetch homepage data from WordPress API
 */
export const getHomePageData = async (): Promise<HomePageData> => {
  const slug = "calculator-home";

  try {
    console.log(`🚀 Fetching homepage data with slug: ${slug}`);
    console.log(`🌐 API URL: ${API_CONFIG.baseUrl}?slug=${slug}`);
    
    const response: AxiosResponse<WordPressApiResponse> = await axiosInstance.get('', {
      params: { slug }
    });
    
    console.log(`✅ Raw API Response:`, response.data);
    const result = response.data;
    
    if (!result.success) {
      throw new Error("Failed to fetch homepage data from WordPress API");
    }
    
    console.log("Successfully fetched homepage data from WordPress API");
    
    // Transform WordPress API response to expected format
    return transformWordPressResponse(result);
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    
    // Check if it's an axios error for better error reporting
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        console.error("Request timeout - please check your connection");
      } else if (axiosError.response) {
        console.error(`API Error ${axiosError.response.status}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error("Network error - unable to reach the server");
      }
    }
    
    // Always re-throw the error - no fallback to mock data
    throw new Error(`Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Get the WordPress API slug for a category ID
 */
const getCategorySlug = (categoryId: string): string => {
  const slug = CATEGORY_SLUGS[categoryId];
  if (!slug) {
    throw new Error(`Unknown category ID: ${categoryId}`);
  }
  return slug;
};

/**
 * Fetch category data from WordPress API
 */
export const getCategoryData = async (categoryId: string): Promise<CalculatorData> => {
  const slug = getCategorySlug(categoryId);
  
  try {
    console.log(`🚀 Fetching category data for ${categoryId} with slug: ${slug}`);
    
    const response: AxiosResponse<WordPressApiResponse> = await axiosInstance.get('', {
      params: { slug }
    });
    
    const result = response.data;
    
    if (!result.success) {
      throw new Error(`Failed to fetch category data for ${categoryId}`);
    }
    
    console.log(`✅ Successfully fetched category data for: ${categoryId}`);
    return result.data;
  } catch (error) {
    console.error(`Error fetching category data for ${categoryId}:`, error);
    
    // Check if it's an axios error for better error reporting
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        console.error(`Request timeout for category: ${categoryId}`);
      } else if (axiosError.response) {
        console.error(`API Error ${axiosError.response.status} for category ${categoryId}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error for category ${categoryId} - no response received`);
      }
    }
    
    // Always re-throw the error - no fallback to mock data
    throw new Error(`Failed to load category data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Fetch calculator results from WordPress API
 */
export const getCalculatorResults = async (categoryId: string): Promise<any> => {
  try {
    console.log(`🎯 Fetching calculator results using slug: calculator-results`);
    
    const response: AxiosResponse<any> = await axiosInstance.get('', {
      params: { 
        slug: 'calculator-results'
      }
    });
    
    const result = response.data;
    
    console.log(`🔍 Raw API response:`, result);
    
    if (!result.success) {
      throw new Error(`Failed to fetch calculator results`);
    }
    
    console.log(`✅ Successfully fetched calculator results data`);
    
    // Transform the flat response structure to match what the component expects
    const transformedResult = {
      success: true,
      data: {
        calculator_results_headline: result.calculator_results_headline,
        calculator_results_description: result.calculator_results_description,
        calculator_results_footer_text: result.calculator_results_footer_text,
        calculator_results_disclaimer: result.calculator_results_disclaimer
      },
      timestamp: Date.now()
    };
    
    console.log(`🔄 Transformed result:`, transformedResult);
    return transformedResult;
  } catch (error) {
    console.error(`Error fetching calculator results:`, error);
    
    // Check if this is a 404 error or any API error (endpoint not available on production)
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.code === 'ERR_NETWORK')) {
      console.warn(`📝 Calculator results endpoint not available, using fallback data`);
      
      // Return fallback data for now until the endpoint is available on production
      return {
        success: true,
        data: {
          calculator_results_headline: "Your Estimate Results",
          calculator_results_description: "Thank you for using our estimate calculator. Your results have been calculated based on the information provided.",
          calculator_results_footer_text: "For a more detailed estimate, please contact our team.",
          calculator_results_disclaimer: "This estimate is preliminary and may vary based on specific project requirements and market conditions."
        },
        timestamp: Date.now()
      };
    }
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        console.error(`Request timeout for calculator results`);
      } else if (axiosError.response) {
        console.error(`API Error ${axiosError.response.status} for calculator results:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error for calculator results - no response received`);
      }
    }
    
    // If it's not a 404 or network error, provide fallback data anyway to prevent the app from breaking
    console.warn(`📝 Providing fallback calculator results data due to error`);
    return {
      success: true,
      data: {
        calculator_results_headline: "Your Estimate Results",
        calculator_results_description: "Thank you for using our estimate calculator. Your results have been calculated based on the information provided.",
        calculator_results_footer_text: "For a more detailed estimate, please contact our team.",
        calculator_results_disclaimer: "This estimate is preliminary and may vary based on specific project requirements and market conditions."
      },
      timestamp: Date.now()
    };
  }
};

/**
 * Fetch calculator email template from WordPress API
 */
export const getCalculatorEmail = async (): Promise<any> => {
  try {
    console.log(`📧 Fetching calculator email template using slug: calculator-email`);
    
    const response: AxiosResponse<any> = await axiosInstance.get('', {
      params: { 
        slug: 'calculator-email'
      }
    });
    
    const result = response.data;
    
    console.log(`🔍 Raw email API response:`, result);
    
    if (!result.success) {
      throw new Error(`Failed to fetch calculator email template`);
    }
    
    console.log(`✅ Successfully fetched calculator email template`);
    
    // Transform the flat response structure to match what we need
    const transformedResult = {
      success: true,
      data: {
        email_subject: result.email_subject || result.calculator_email_subject || "Your Estimate Results",
        email_html: result.calculator_email_body || result.email_html || result.calculator_email_html || "",
        email_text: result.email_text || result.calculator_email_text || ""
      },
      timestamp: Date.now()
    };
    
    console.log(`🔄 Transformed email result:`, transformedResult);
    return transformedResult;
  } catch (error) {
    console.error(`Error fetching calculator email template:`, error);
    
    // Provide fallback email template
    console.warn(`📝 Providing fallback email template due to error`);
    return {
      success: true,
      data: {
        email_subject: "Your Estimate Results",
        email_html: "<p>Thank you for using our estimate calculator. Your results are ready!</p>",
        email_text: "Thank you for using our estimate calculator. Your results are ready!"
      },
      timestamp: Date.now()
    };
  }
};

/**
 * Send email using SendGrid API
 */
export const sendCalculatorEmail = async (
  toEmail: string, 
  userName: string, 
  emailContent: string, 
  subject: string = "Got your estimate request 👍 Here's what's next"
): Promise<any> => {
  try {
    console.log(`📤 Sending calculator email to: ${toEmail}`);
    console.log(`📧 Email content received:`, emailContent);
    console.log(`📧 Email content length:`, emailContent?.length || 0);
    
    // Check if emailContent is empty and provide fallback
    const finalEmailContent = emailContent && emailContent.trim() 
      ? emailContent 
      : "<p>Thank you for using our estimate calculator. Your personalized results have been calculated based on your selections.</p><p>We'll be in touch soon with your detailed estimate.</p>";
    
    // console.log(`📧 Final email content to use:`, finalEmailContent);
    
    // Personalize the email content
    const personalizedContent = `<p>Hello ${userName},</p>${finalEmailContent}`;
    
    const emailData = {
      personalizations: [
        {
          to: [{ email: toEmail, name: userName }],
          subject: subject
        }
      ],
      from: {
        email: "info@rpkconstruction.com",
        // email: "hack4lk@gmail.com",
        name: "RPK Construction"
      },
      content: [
        {
          type: "text/html",
          value: personalizedContent
        }
      ]
    };
    
    console.log(`📧 Email data prepared:`, emailData);
    
    // Create the correct URL for the email endpoint
    // We need to construct this differently since axiosInstance baseURL points to get-calculator-data
    const emailApiUrl = API_CONFIG.baseUrl.replace('/get-calculator-data', '/send-email');
    console.log(`📤 Posting to email API URL: ${emailApiUrl}`);
    
    // Post to WordPress API endpoint using the correct URL
    const response: AxiosResponse<any> = await axios.post(emailApiUrl, emailData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: API_CONFIG.timeout,
    });
    
    console.log(`✅ Email API response:`, response.data);
    
    if (response.data.success) {
      console.log(`✅ Email sent successfully to ${toEmail}`);
      return { success: true, message: "Email sent successfully", data: response.data };
    } else {
      throw new Error(response.data.message || "Email sending failed");
    }
  } catch (error) {
    console.error(`Error sending calculator email:`, error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error(`Email API Error ${axiosError.response.status}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error sending email - no response received`);
      }
    }
    
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Create JobTread customer using WordPress API
 */
export const createJobTreadCustomer = async (formData: any): Promise<any> => {
  try {
    console.log(`👤 Creating JobTread customer with data:`, formData);
    
    // Create the correct URL for the customer creation endpoint
    const customerApiUrl = API_CONFIG.baseUrl.replace('/get-calculator-data', '/create-jobtread-customer');
    console.log(`📤 Posting to customer API URL: ${customerApiUrl}`);
    
    // Post to WordPress API endpoint using the correct URL
    const response: AxiosResponse<any> = await axios.post(customerApiUrl, formData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: API_CONFIG.timeout,
    });
    
    console.log(`✅ Customer creation API response:`, response.data);
    
    if (response.data.success) {
      console.log(`✅ JobTread customer created successfully`);
      return { success: true, message: "Customer created successfully", data: response.data };
    } else {
      throw new Error(response.data.message || "Customer creation failed");
    }
  } catch (error) {
    console.error(`Error creating JobTread customer:`, error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error(`Customer API Error ${axiosError.response.status}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error creating customer - no response received`);
      }
    }
    
    throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Create JobTread account and contact using enhanced WordPress API
 */
export const createJobTreadAccountContact = async (formData: any): Promise<any> => {
  try {
    console.log(`🏢 Creating JobTread account and contact with data:`, formData);
    
    // Create the correct URL for the enhanced account and contact creation endpoint
    const accountContactApiUrl = API_CONFIG.baseUrl.replace('/get-calculator-data', '/create-jobtread-account-contact');
    console.log(`📤 Posting to account/contact API URL: ${accountContactApiUrl}`);
    
    // Prepare the data in the required format
    const requestData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      zip: formData.zip
    };
    
    console.log(`📋 Request data:`, requestData);
    
    // Post to WordPress API endpoint using the correct URL
    const response: AxiosResponse<any> = await axios.post(accountContactApiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: API_CONFIG.timeout,
    });
    
    console.log(`✅ Account/Contact creation API response:`, response.data);
    
    if (response.data.success) {
      console.log(`✅ JobTread account and contact created successfully. Account ID: ${response.data.account_id}`);
      return { 
        success: true, 
        message: "Account and contact created successfully", 
        data: response.data,
        accountId: response.data.account_id 
      };
    } else {
      throw new Error(response.data.message || "Account and contact creation failed");
    }
  } catch (error) {
    console.error(`Error creating JobTread account and contact:`, error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error(`Account/Contact API Error ${axiosError.response.status}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error creating account/contact - no response received`);
      }
    }
    
    throw new Error(`Failed to create account and contact: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Send marketing notification email to info@rpkconstruction.com
 */
export const sendMarketingNotification = async (formData: any, estimateBreakdownHTML: string): Promise<any> => {
  try {
    console.log(`📬 Sending marketing notification for new lead: ${formData.email}`);
    
    // Create detailed marketing email content
    const marketingEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C12530; border-bottom: 2px solid #C12530; padding-bottom: 10px;">
          🎯 New Estimate Calculator Lead
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Contact Information:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${formData.email}">${formData.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;"><a href="tel:${formData.phone}">${formData.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">ZIP Code:</td>
              <td style="padding: 8px;">${formData.zip}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Submission Time:</td>
              <td style="padding: 8px;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Customer's Project Estimate:</h3>
          ${estimateBreakdownHTML}
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #0066cc; margin-top: 0;">📞 Next Steps:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Follow up with customer within 24 hours</li>
            <li>Schedule consultation if interested</li>
            <li>Customer has already received their estimate via email</li>
            <li>JobTread account and contact have been created automatically</li>
          </ul>
        </div>

        <p style="color: #666; font-style: italic; margin-top: 30px;">
          This notification was automatically generated by the RPK Construction Estimate Calculator.
        </p>
      </div>
    `;

    const emailData = {
      personalizations: [
        {
          to: [{ 
            email: "info@rpkconstruction.com", 
            // email: "hack4lk@gmail.com",
            name: "RPK Construction Marketing" 
          }],
          subject: `🏗️ New Estimate Lead: ${formData.name} (${formData.email})`
        }
      ],
      from: {
        email: "info@rpkconstruction.com",
        name: "RPK Estimate Calculator"
      },
      content: [
        {
          type: "text/html",
          value: marketingEmailContent
        }
      ]
    };
    
    console.log(`📧 Marketing email data prepared for: info@rpkconstruction.com`);
    
    // Create the correct URL for the email endpoint
    const emailApiUrl = API_CONFIG.baseUrl.replace('/get-calculator-data', '/send-email');
    console.log(`📤 Posting marketing notification to email API URL: ${emailApiUrl}`);
    
    // Post to WordPress API endpoint
    const response: AxiosResponse<any> = await axios.post(emailApiUrl, emailData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: API_CONFIG.timeout,
    });
    
    console.log(`✅ Marketing notification response status: ${response.status}`);
    console.log(`📧 Marketing notification sent successfully to info@rpkconstruction.com`);
    
    if (response.data.success) {
      return {
        success: true,
        message: "Marketing notification sent successfully",
        data: response.data
      };
    } else {
      throw new Error(response.data.message || "Marketing notification failed");
    }
    
  } catch (error) {
    console.error("Error sending marketing notification:", error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error(`Marketing Email API Error ${axiosError.response.status}:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error(`Network error sending marketing notification - no response received`);
      }
    }
    
    throw new Error(`Failed to send marketing notification: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Export the main API service object for backward compatibility
export const apiService = {
  getHomePageData,
  getCategoryData,
  getCalculatorResults,
  getCalculatorEmail,
  sendCalculatorEmail,
  createJobTreadCustomer,
  createJobTreadAccountContact,
  sendMarketingNotification
};
