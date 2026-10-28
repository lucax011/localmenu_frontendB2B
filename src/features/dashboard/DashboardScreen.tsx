import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getReport, getRestaurantOrders } from '@/api/client';
import { useMenu, useRestaurant } from '@/hooks/data';
import { Empty, Panel, Screen, SectionTitle, Stat } from '@/components/ui';
import { isOpenOrder, money, paidLabel, STATUS_COLOR, STATUS_LABEL, timeAgo } from '@/utils/format';
import { colors } from '@/theme';

const ACTIONS = [
  { route: 'Orders', icon: 'receipt', title: 'Pedidos', text: 'Aceite e acompanhe' },
  { route: 'Menu', icon: 'silverware-fork-knife', title: 'Cardápio', text: 'Itens e categorias' },
  { route: 'OCRImport', icon: 'camera', title: 'Importar por foto', text: 'O OCR lê o cardápio' },
  { route: 'Reports', icon: 'chart-bar', title: 'Vendas', text: 'Faturamento e ranking' },
  { route: 'Restaurant', icon: 'storefront', title: 'Meu restaurante', text: 'Dados e contato' },
] as const;

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const { restaurant, isLoading, refetch } = useRestaurant();
  const id = restaurant?.id;
  const { menu } = useMenu(id);
  const orders = useQuery({
    queryKey: ['orders', id],
    enabled: !!id,
    queryFn: () => getRestaurantOrders(id!),
    refetchInterval: 15000,
  });
  const today = useQuery({
    queryKey: ['report', id, 1],
    enabled: !!id,
    queryFn: () => getReport(id!, 1),
  });

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!restaurant) {
    return (
      <Screen>
        <Empty
          title="Cadastre seu restaurante"
          text="Antes de montar o cardápio, informe nome, endereço e telefone."
        />
        <Button mode="contained" onPress={() => nav.navigate('Restaurant')}>
          Cadastrar restaurante
        </Button>
      </Screen>
    );
  }

  const open = (orders.data ?? []).filter((o) => isOpenOrder(o.status));
  const itemCount = menu?.categories.reduce((n, c) => n + c.items.length, 0) ?? 0;

  return (
    <Screen
      refreshing={orders.isRefetching}
      onRefresh={() => {
        refetch();
        orders.refetch();
        today.refetch();
      }}
    >
      <View style={styles.hero}>
        <Text variant="labelLarge" style={styles.heroLabel}>
          Painel do restaurante
        </Text>
        <Text variant="headlineMedium" style={styles.heroTitle}>
          {restaurant.name}
        </Text>
        <Text variant="bodyMedium" style={styles.heroText}>
          {restaurant.address || 'Endereço não informado'}
        </Text>
      </View>

      <View style={styles.stats}>
        <Stat label="Pedidos em aberto" value={String(open.length)} />
        <Stat
          label="Vendas em 24 h"
          value={money(today.data?.revenue ?? 0)}
          hint={paidLabel(today.data?.paidOrders ?? 0)}
        />
        <Stat label="Itens no cardápio" value={String(itemCount)} />
      </View>

      <SectionTitle
        right={
          open.length ? (
            <Button compact onPress={() => nav.navigate('Orders')}>
              Ver todos
            </Button>
          ) : undefined
        }
      >
        Para agora
      </SectionTitle>
      {open.length ? (
        open.slice(0, 3).map((o) => (
          <Pressable key={o.id} onPress={() => nav.navigate('Orders')}>
            <Panel style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall">
                  #{o.orderNumber} · {o.customer.name}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  {o.items.map((i) => `${i.quantity}× ${i.nameSnapshot}`).join(', ')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.badge, { color: STATUS_COLOR[o.status] }]}>
                  {STATUS_LABEL[o.status]}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  {timeAgo(o.createdAt)}
                </Text>
              </View>
            </Panel>
          </Pressable>
        ))
      ) : (
        <Empty title="Nenhum pedido em aberto" text="Os pedidos novos aparecem aqui." />
      )}

      <SectionTitle>Atalhos</SectionTitle>
      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <Pressable key={a.route} style={styles.tile} onPress={() => nav.navigate(a.route)}>
            <View style={styles.tileIcon}>
              <Icon source={a.icon} size={22} color={colors.brand} />
            </View>
            <Text variant="titleSmall" style={{ fontWeight: '700' }}>
              {a.title}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              {a.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  hero: { backgroundColor: colors.brandDark, borderRadius: 18, padding: 20 },
  heroLabel: { color: '#FDBA74' },
  heroText: { color: '#FED7AA', marginTop: 4 },
  heroTitle: { color: '#fff', fontWeight: '800', marginTop: 2 },
  orderRow: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 12 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 160,
    flexGrow: 1,
    gap: 2,
    padding: 14,
  },
  tileIcon: {
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginBottom: 8,
    width: 38,
  },
});
