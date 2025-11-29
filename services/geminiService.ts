import { GoogleGenAI } from "@google/genai";
import { Customer, Sale, Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingMessage = async (customer: Customer, product?: Product): Promise<string> => {
  try {
    const prompt = `
      Act as a Libyan sales assistant. Write a short, friendly WhatsApp message in Libyan Arabic dialect to a customer named ${customer.name}.
      Context: ${product ? `We have a special offer on ${product.name}.` : 'Just checking in to see if they need anything.'}
      Customer Status: ${customer.status}.
      Keep it professional but warm. Do not include placeholders like [Your Name].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "عذراً، لم أتمكن من إنشاء الرسالة.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "خطأ في الاتصال بالذكاء الاصطناعي.";
  }
};

export const analyzeSales = async (sales: Sale[]): Promise<string> => {
  try {
    const salesSummary = JSON.stringify(sales.slice(-10)); // Analyze last 10 sales to save tokens
    const prompt = `
      Analyze these recent sales transactions for a Libyan SME: ${salesSummary}.
      Provide a brief summary in Arabic focusing on:
      1. Best performing items.
      2. Suggestions to increase sales.
      Format as a bulleted list.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لا توجد بيانات كافية للتحليل.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "خطأ في تحليل البيانات.";
  }
};