// src/services/apiService.js

import { CONFIG } from "./constant";



class ApiService {
  /**
   * Récupérer tous les domaines avec leurs catégories
   */
  async getDomains() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/domains`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.transformDomainsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des domaines:', error);
      throw error;
    }
  }

  /**
   * Récupérer les questions d'une catégorie spécifique
   */
  async getQuestionsByCategory(categoryId) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/category/${categoryId}/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.transformQuestionsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      throw error;
    }
  }

  /**
   * Transformer les données des domaines du format API vers le format attendu par le frontend
   */
transformDomainsData(apiData) {
    const domains = {};
    
    apiData.forEach(domain => {
      const categories = {};
      
      domain.categories.forEach(category => {
        categories[category.name_ar] = {
          icon: category.icon,
          gradient: category.gradient,
          questions: [], // Les questions seront chargées séparément
          _meta: {
            id: category.id, // Store the category ID here
            slug: category.slug
          }
        };
      });
      
      domains[domain.name_ar] = {
        id: domain.slug,
        icon: domain.icon,
        description: domain.description_ar,
        order: domain.order,
        gradient: domain.gradient,
        requirements: domain.requirements || {},
        categories: categories,
        _meta: {
          id: domain.id,
          slug: domain.slug
        }
      };
    });
    
    return domains;
  }

  /**
   * Transformer les données des questions du format API vers le format attendu par le frontend
   */
  transformQuestionsData(apiQuestions) {
    return apiQuestions.map(q => {
      const baseQuestion = {
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        explanation: q.explanation,
        image: q.image_url
      };

      // Fusionner avec les détails spécifiques selon le type
      switch (q.question_type) {
        case 'qcm':
        case 'true-false':
          return {
            ...baseQuestion,
            options: q.details.options,
            correct: q.details.correct
          };

        case 'fill-in-blanks':
          return {
            ...baseQuestion,
           question: q.question_text, // Correction 1 de l'erreur précédente
           words: q.details.words,    // <--- AJOUTEZ/VÉRIFIEZ CETTE LIGNE
           blanks: q.details.blanks
          };

        case 'multiple-checkbox':
          return {
            ...baseQuestion,
            options: q.details.options
          };

        case 'drag-drop-timeline':
        case 'reorder':
          return {
            ...baseQuestion,
            items: q.details.items
          };

        case 'match-arrows':
          return {
            ...baseQuestion,
            leftColumn: q.details.leftColumn,
            rightColumn: q.details.rightColumn,
            correctMatches: q.details.correctMatches
          };

        default:
          return {
            ...baseQuestion,
            ...q.details
          };
      }
    });
  }

  /**
   * Créer une nouvelle question (pour l'admin)
   */
  async createQuestion(questionData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      throw error;
    }
  }

  /**
   * Supprimer une question (pour l'admin)
   */
  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/questions/${questionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      throw error;
    }
  }
}

export default ApiService();