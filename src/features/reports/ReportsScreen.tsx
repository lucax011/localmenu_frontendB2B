import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, SegmentedButtons, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getReport } from '@/api/client';
import type { OrderStatus } from '@/api/types';
import { useRestaurant } from '@/hooks/data';
import { Empty, Panel, Screen, SectionTitle, Stat } from '@/components/ui';
import { money, STATUS_COLOR, STATUS_LABEL } from '@/utils/format';
import { colors } from '@/theme';

const PERIODS = ['7', '30', '90'];

export default function ReportsScreen() {
  const { restaurant } = useRestaurant();
  const id = restaurant?.id;
  const [days, setDays] = useState('7');
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['report', id, Number(days)],
    enabled: !!id,
    queryFn: () => getReport(id!, Number(days)),
  });

  const top = data?.topItems ?? [];
  const maxQty = Math.max(1, ...top.map((i) => i.quantity));
  const statuses = Object.entries(data?.byStatus ?? {}) as [OrderStatus, number][];

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <SegmentedButtons
        value={days}
        onValueChange={setDays}
        buttons={PERIODS.map((d) => ({ value: d, label: `${d} dias` }))}
      />
      {isLoading || !data ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={styles.stats}>
            <Stat label="Faturamento" value={money(data.revenue)} hint="pedidos pagos" />
            <Stat label="Ticket médio" value={money(data.averageTicket)} />
            <Stat label="Pedidos" value={String(data.orders)} hint={`${data.paidOrders} pagos`} />
          </View>

          <SectionTitle>Mais vendidos</SectionTitle>
          {top.length ? (
            <Panel style={{ gap: 14 }}>
              {top.map((item, i) => (
                <View key={item.name}>
                  <View style={styles.rankRow}>
                    <Text variant="bodyMedium" style={{ flex: 1, fontWeight: '600' }}>
                      {i + 1}. {item.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.muted }}>
                      {item.quantity} un. · {money(item.revenue)}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.bar, { width: `${(item.quantity / maxQty) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </Panel>
          ) : (
            <Empty title="Sem vendas no período" />
          )}

          {statuses.length ? (
            <>
              <SectionTitle>Pedidos por situação</SectionTitle>
              <Panel style={styles.statusWrap}>
                {statuses.map(([status, count]) => (
                  <View key={status} style={styles.statusPill}>
                    <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
                    <Text variant="bodyMedium">
                      {STATUS_LABEL[status]}: <Text style={{ fontWeight: '700' }}>{count}</Text>
                    </Text>
                  </View>
                ))}
              </Panel>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.brand, borderRadius: 4, height: 8 },
  dot: { borderRadius: 5, height: 10, width: 10 },
  rankRow: { alignItems: 'baseline', flexDirection: 'row', gap: 8, marginBottom: 6 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statusPill: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  track: { backgroundColor: '#F5EDE4', borderRadius: 4, height: 8, overflow: 'hidden' },
});
