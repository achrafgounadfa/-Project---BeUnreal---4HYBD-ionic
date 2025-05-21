import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Geolocation, GeolocationPosition, PermissionStatus } from '@capacitor/geolocation';

// Interface pour simuler les types de MediaFile
interface MediaFile {
  name: string;
  fullPath: string;
  type: string;
  lastModifiedDate: number;
  size: number;
}

// Service pour la caméra
export const cameraService = {
  // Prendre une photo
  takePhoto: async (): Promise<Photo> => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    return image;
  },
  
  // Sélectionner une image depuis la galerie
  selectFromGallery: async (): Promise<Photo> => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    
    return image;
  },
  
  // Capturer une vidéo (simulation pour le web)
  captureVideo: async (): Promise<MediaFile[]> => {
    console.log('Capture vidéo simulée - fonctionnalité non disponible en mode web');
    
    // Simuler un délai pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retourner un fichier média simulé
    return [{
      name: 'video_simulee.mp4',
      fullPath: 'https://example.com/video_simulee.mp4',
      type: 'video/mp4',
      lastModifiedDate: Date.now(),
      size: 1024 * 1024 // 1MB
    }];
  }
};

// Service pour la géolocalisation
export const geolocationService = {
  // Vérifier les permissions
  checkPermissions: async (): Promise<PermissionStatus> => {
    return Geolocation.checkPermissions();
  },
  
  // Demander les permissions
  requestPermissions: async (): Promise<PermissionStatus> => {
    return Geolocation.requestPermissions();
  },
  
  // Obtenir la position actuelle
  getCurrentPosition: async (): Promise<GeolocationPosition> => {
    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
  },
  
  // Calculer la distance entre deux points (en km)
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  },
  
  // Obtenir l'adresse à partir des coordonnées (géocodage inverse)
  getAddressFromCoordinates: async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extraire les informations pertinentes
        const city = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || '';
        const country = data.address.country || '';
        
        // Construire une adresse lisible
        return [city, state, country].filter(Boolean).join(', ');
      }
      
      return 'Localisation inconnue';
    } catch (err) {
      console.error('Erreur lors du géocodage inverse:', err);
      return 'Localisation inconnue';
    }
  }
};
