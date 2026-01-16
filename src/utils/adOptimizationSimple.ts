export interface AdPlacement {
  id: string;
  name: string;
  format: 'display' | 'native' | 'video' | 'sticky';
  position: 'header' | 'sidebar' | 'content' | 'footer';
  frequency: number;
  minScrollDepth: number;
  categoryOptimization: Record<string, string>;
  responsiveBreakpoints: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  isHighValue: boolean;
}

export const adPlacements: AdPlacement[] = [
  {
    id: 'HEADER_BILLBOARD',
    name: 'Header Billboard',
    format: 'display',
    position: 'header',
    frequency: 1,
    minScrollDepth: 0,
    categoryOptimization: {
      technology: 'TECH_HEADER_UNIT',
      business: 'BUSINESS_HEADER_UNIT',
      education: 'EDUCATION_HEADER_UNIT',
      default: 'HEADER_MAIN_UNIT'
    },
    responsiveBreakpoints: {
      mobile: false,
      tablet: true,
      desktop: true
    },
    isHighValue: true
  },
  {
    id: 'CONTENT_IN_FEED_1',
    name: 'In-Feed Ad 1',
    format: 'native',
    position: 'content',
    frequency: 3,
    minScrollDepth: 25,
    categoryOptimization: {
      lifestyle: 'LIFESTYLE_NATIVE_1',
      entertainment: 'ENTERTAINMENT_NATIVE_1',
      travel: 'TRAVEL_NATIVE_1',
      default: 'CONTENT_NATIVE_1'
    },
    responsiveBreakpoints: {
      mobile: true,
      tablet: true,
      desktop: true
    },
    isHighValue: true
  },
  {
    id: 'CONTENT_IN_FEED_2',
    name: 'In-Feed Ad 2',
    format: 'native',
    position: 'content',
    frequency: 5,
    minScrollDepth: 50,
    categoryOptimization: {
      food: 'FOOD_NATIVE_1',
      sports: 'SPORTS_NATIVE_1',
      technology: 'TECH_NATIVE_1',
      default: 'CONTENT_NATIVE_2'
    },
    responsiveBreakpoints: {
      mobile: true,
      tablet: true,
      desktop: true
    },
    isHighValue: true
  }
];

export class AdPlacementOptimizer {
  static getOptimalPlacements(
    contentType: string,
    scrollDepth: number,
    deviceType: 'mobile' | 'tablet' | 'desktop',
    postCount: number
  ): AdPlacement[] {
    return adPlacements.filter(placement => {
      if (!placement.responsiveBreakpoints[deviceType]) {
        return false;
      }
      if (scrollDepth < placement.minScrollDepth) {
        return false;
      }
      if (postCount % placement.frequency !== 0) {
        return false;
      }
      if (placement.isHighValue && scrollDepth >= placement.minScrollDepth) {
        return true;
      }
      return false;
    });
  }

  static getOptimizedAdUnit(
    placementId: string,
    contentType: string
  ): string {
    const placement = adPlacements.find(p => p.id === placementId);
    if (!placement) return 'DEFAULT_AD_UNIT';
    
    const catOpt = placement.categoryOptimization;
    return catOpt[contentType] || catOpt.default || 'DEFAULT_AD_UNIT';
  }

  static shouldShowAd(
    placementId: string,
    postCount: number,
    scrollDepth: number
  ): boolean {
    const placement = adPlacements.find(p => p.id === placementId);
    if (!placement) return false;
    
    if (postCount % placement.frequency !== 0) {
      return false;
    }
    
    return scrollDepth >= placement.minScrollDepth;
  }

  static getRevenueProjection(placement: AdPlacement, estimatedViews: number): {
    daily: number;
    monthly: number;
    yearly: number;
  } {
    const cpmRates: Record<string, number> = {
      display: placement.isHighValue ? 2.5 : 1.2,
      native: placement.isHighValue ? 3.8 : 2.1,
      video: placement.isHighValue ? 8.5 : 4.2,
      sticky: 1.8
    };
    
    const cpm = cpmRates[placement.format] || 1.2;
    const dailyRevenue = (estimatedViews / 1000) * cpm;
    
    return {
      daily: dailyRevenue,
      monthly: dailyRevenue * 30,
      yearly: dailyRevenue * 365
    };
  }
}