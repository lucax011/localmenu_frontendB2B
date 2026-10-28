import { useQuery } from '@tanstack/react-query';
import { createMenu, getMenus, getMyRestaurants } from '@/api/client';

// Restaurante do dono logado (por enquanto, o primeiro dele)
export const useRestaurant = () => {
  const query = useQuery({ queryKey: ['restaurants'], queryFn: getMyRestaurants });
  return { ...query, restaurant: query.data?.[0] ?? null };
};

// Cardápio principal do restaurante; cria um vazio na primeira vez
export const useMenu = (restaurantId: string | undefined) => {
  const query = useQuery({
    queryKey: ['menus', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const menus = await getMenus(restaurantId!);
      if (menus.length) return menus;
      return [await createMenu(restaurantId!)];
    },
  });
  return { ...query, menu: query.data?.[0] ?? null };
};
