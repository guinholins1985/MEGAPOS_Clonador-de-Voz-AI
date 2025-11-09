import type { PrebuiltVoice } from './types';

// A API Gemini TTS oferece um conjunto específico de vozes de alta qualidade.
// Mapeamos essas vozes para os nomes/estilos solicitados pelo usuário para fornecer uma rica experiência de seleção.
export const PREBUILT_VOICES: PrebuiltVoice[] = [
  // Vozes em Português (BR)
  { id: 'Zephyr', name: 'Rafael', description: 'Masculino (BR) - Calmo e Profissional' },
  { id: 'Kore', name: 'Vitória', description: 'Feminino (BR) - Claro e Amigável' },
  { id: 'Charon', name: 'Ricardo', description: 'Masculino (BR) - Profundo e Autoritário' },
  { id: 'Fenrir', name: 'Camila', description: 'Feminino (BR) - Acolhedor e Expressivo' },
  { id: 'Puck', name: 'Felipe', description: 'Masculino (BR) - Jovem e Amigável' },
  { id: 'Kore', name: 'Isabela', description: 'Feminino (BR) - Doce e Jovem' },
  { id: 'Zephyr', name: 'Daniel', description: 'Masculino (BR) - Claro e Confiante' },
  { id: 'Fenrir', name: 'Lúcia', description: 'Feminino (BR) - Calmo e Maternal' },
  { id: 'Puck', name: 'Thiago', description: 'Masculino (BR) - Jovem e Energético' },
  { id: 'Kore', name: 'Juliana', description: 'Feminino (BR) - Vibrante e Alegre' },
  { id: 'Fenrir', name: 'Fabiana', description: 'Feminino (BR) - Profissional e Elegante' },
  { id: 'Charon', name: 'Antônio', description: 'Masculino (BR) - Maduro e Sábio' },
  { id: 'Kore', name: 'Bruna', description: 'Feminino (BR) - Jovem e Descontraído' },
  { id: 'Zephyr', name: 'Carlos', description: 'Masculino (BR) - Corporativo e Sério' },
  { id: 'Fenrir', name: 'Ana', description: 'Feminino (BR) - Suave e Confiável' },

  // Vozes em Inglês (EUA)
  { id: 'Zephyr', name: 'Matthew', description: 'Masculino (EUA) - Padrão Americano' },
  { id: 'Kore', name: 'Emma', description: 'Feminino (EUA) - Jovem e Claro' },
  { id: 'Fenrir', name: 'Joanna', description: 'Feminino (EUA) - Suave e Profissional' },
  { id: 'Kore', name: 'Ivy', description: 'Feminino (EUA) - Jovem e Enérgico' },
  { id: 'Puck', name: 'Justin', description: 'Masculino (EUA) - Jovem e Casual' },
  { id: 'Puck', name: 'Joey', description: 'Masculino (EUA) - Amigável e Otimista' },

  // Vozes em Inglês (Reino Unido)
  { id: 'Charon', name: 'Brian', description: 'Masculino (Reino Unido) - Sotaque Britânico Clássico' },
  { id: 'Kore', name: 'Amy', description: 'Feminino (Reino Unido) - Jovem e Moderno' },
  { id: 'Fenrir', name: 'Olivia', description: 'Feminino (Reino Unido) - Elegante e Sofisticado' },

  // Vozes em Espanhol
  { id: 'Zephyr', name: 'Enrique', description: 'Masculino (Espanha) - Castelhano Padrão' },
  { id: 'Kore', name: 'Conchita', description: 'Feminino (Espanha) - Clara e Expressiva' },
  { id: 'Puck', name: 'Miguel', description: 'Masculino (México) - Latino-americano Jovem' },
  { id: 'Fenrir', name: 'Lupe', description: 'Feminino (México) - Acolhedora e Amigável' },
  { id: 'Kore', name: 'Penélope', description: 'Feminino (Espanha) - Suave e Elegante' },
  
  // Vozes em Francês
  { id: 'Kore', name: 'Céline', description: 'Feminino (França) - Sofisticado e Melódico' },
  { id: 'Fenrir', name: 'Léa', description: 'Feminino (França) - Jovem e Natural' },
  { id: 'Zephyr', name: 'Mathieu', description: 'Masculino (França) - Calmo e Profundo' },

  // Vozes em Alemão
  { id: 'Charon', name: 'Hans', description: 'Masculino (Alemanha) - Forte e Autoritário' },
  { id: 'Fenrir', name: 'Marlene', description: 'Feminino (Alemanha) - Clara e Precisa' },
  { id: 'Kore', name: 'Vicki', description: 'Feminino (Alemanha) - Jovem e Amigável' },

  // Vozes em Italiano
  { id: 'Kore', name: 'Carla', description: 'Feminino (Itália) - Expressiva e Apaixonada' },
  { id: 'Zephyr', name: 'Giorgio', description: 'Masculino (Itália) - Clássico e Confiante' },

  // Vozes em Japonês
  { id: 'Kore', name: 'Mizuki', description: 'Feminino (Japão) - Suave e Educado' },
  { id: 'Puck', name: 'Takumi', description: 'Masculino (Japão) - Jovem e Energético' },

  // Vozes em Coreano
  { id: 'Kore', name: 'Seoyeon', description: 'Feminino (Coreia) - Claro e Moderno' },
  { id: 'Puck', name: 'Ji-min', description: 'Masculino (Coreia) - Jovem e Popular' },

  // Vozes em Chinês (Mandarim)
  { id: 'Kore', name: 'Zhiyu', description: 'Feminino (Mandarim) - Suave e Padrão' },
  { id: 'Zephyr', name: 'KangKang', description: 'Masculino (Mandarim) - Claro e Padrão' },
  
  // Vozes em Árabe
  { id: 'Kore', name: 'Zeina', description: 'Feminino (Árabe) - Melódico e Claro' },
  { id: 'Charon', name: 'Khalid', description: 'Masculino (Árabe) - Profundo e Respeitado' },
  
  // Vozes em Russo
  { id: 'Fenrir', name: 'Tatyana', description: 'Feminino (Rússia) - Clara e Forte' },
  { id: 'Charon', name: 'Maxim', description: 'Masculino (Rússia) - Profundo e Sério' },

  // Vozes em Hindi
  { id: 'Kore', name: 'Aditi', description: 'Feminino (Índia) - Jovem e Moderno' },
  { id: 'Fenrir', name: 'Raveena', description: 'Feminino (Índia) - Elegante e Clássico' },
];