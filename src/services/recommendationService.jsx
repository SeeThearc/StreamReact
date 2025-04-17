// src/services/recommendationService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/geminiConfig';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getRecommendations = async (myListItems) => {
  try {
    const formattedList = myListItems.map(item => 
      `${item.title} (${item.mediaType === 'movie' ? 'Movie' : 'TV Show'})`
    ).join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Based on this list of movies and TV shows:
      ${formattedList}
      
      Please recommend 8 similar content that I might like.
      For each recommendation, provide the title, whether it's a movie or TV show, release year, and a brief reason why I might like it based on my list.
      Format the response as JSON with the structure:
      [
        {
          "id": "unique-id-1",
          "title": "Title",
          "mediaType": "movie/tv",
          "year": "Year",
          "reason": "Why I might like it"
        }
      ]
      Only provide the JSON array, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      
      return recommendations.map(item => ({
        ...item,
        image: `https://via.placeholder.com/300x450?text=${encodeURIComponent(item.title)}`,
        genres: item.mediaType === 'movie' ? 'Recommended Movie' : 'Recommended Show',
        duration: item.year
      }));
    }
    
    throw new Error('Failed to parse recommendation response');
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};