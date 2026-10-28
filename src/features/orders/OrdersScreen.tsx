import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons, Snackbar, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage, getRestaurantOrders, updateOrderStatus } from '@/api/client';
import type { Order, OrderStatus } from '@/api/types';
import { useRestaurant } from '@/hooks/data';
import { Empty, Panel, Screen } from '@/components/ui';
import {
  isOpenOrder,
  money,
  STATUS_ACTIONS,
  STATUS_COLOR,
  STATUS_LABEL,
  timeAgo,
} from '@/utils/format';
import { colors } from '@/theme';

export default function OrdersScreen() {
  const { restaurant } = useRestaurant();
  const id = restaurant?.id;
  const qc = useQueryClient();
  const [tab, setTab] = useState<'open' | 'done'>('open');
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['orders', id],
    enabled: !!id,
    queryFn: () => getRestaurantOrders(id!),
    refetchInterval: 10000,
  });
  const move = useMutation({
    mutationFn: ({ order, to }: { order: Order; to: OrderStatus }) =>
      updateOrderStatus(order.id, to),
    onSuccess: (_d, { order, to }) => {
      setMessage(`Pedido #${order.orderNumber}: ${STATUS_LABEL[to].toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['orders', id] });
      qc.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (e) => setMessage(errorMessage(e)),
  });

  const all = data ?? [];
  const list = all.filter((o) => (tab === 'open' ? isOpenOrder(o.status) : !isOpenOrder(o.status)));
  const openCount = all.filter((o) => isOpenOrder(o.status)).length;

  return (
    <Screen
      refreshing={isRefetching}
      onRefresh={refetch}
      footer={
        <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={2500}>
          {message}
        </Snackbar>
      }
    >
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as 'open' | 'done')}
        buttons={[
          { value: 'open', label: `Em aberto (${openCount})` },
          { value: 'done', label: 'Finalizados' },
        ]}
      />
      {isLoading ? <ActivityIndicator style={{ marginTop: 24 }} /> : null}
      {!isLoading && !list.length ? (
        <Empty
          title={tab === 'open' ? 'Tudo em dia' : 'Nenhum pedido finalizado'}
          text={tab === 'open' ? 'Novos pedidos entram aqui sozinhos.' : undefined}
        />
      ) : null}
      {list.map((o) => (
        <Panel key={o.id}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                #{o.orderNumber}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {o.customer.name}
                {o.customer.phone ? ` · ${o.customer.phone}` : ''} · {timeAgo(o.createdAt)}
              </Text>
            </View>
            <View style={[styles.status, { borderColor: STATUS_COLOR[o.status] }]}>
              <Text style={{ color: STATUS_COLOR[o.status], fontWeight: '700', fontSize: 12 }}>
                {STATUS_LABEL[o.status]}
              </Text>
            </View>
          </View>

          <View style={styles.items}>
            {o.items.map((i) => (
              <View key={i.id} style={styles.line}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {i.quantity}× {i.nameSnapshot}
                </Text>
                <Text variant="bodyMedium">{money(i.totalPrice)}</Text>
              </View>
            ))}
            {o.customerNotes ? (
              <Text variant="bodySmall" style={styles.notes}>
                Obs.: {o.customerNotes}
              </Text>
            ) : null}
          </View>

          <View style={styles.foot}>
            <View>
              <Text variant="titleSmall">{money(o.total)}</Text>
              <Text
                variant="bodySmall"
                style={{ color: o.payment?.status === 'PAID' ? colors.ok : colors.warn }}
              >
                {o.payment?.status === 'PAID'
                  ? `Pago (${o.payment.method.toLowerCase().replace('_', ' ')})`
                  : 'Aguardando pagamento'}
              </Text>
            </View>
            <View style={styles.actions}>
              {STATUS_ACTIONS[o.status].map((a) => (
                <Button
                  key={a.to}
                  compact
                  mode={a.to === 'CANCELLED' ? 'text' : 'contained'}
                  textColor={a.to === 'CANCELLED' ? colors.danger : undefined}
                  disabled={move.isPending}
                  onPress={() => move.mutate({ order: o, to: a.to })}
                >
                  {a.label}
                </Button>
              ))}
            </View>
          </View>
        </Panel>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foot: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  head: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  items: {
    borderColor: colors.line,
    borderTopWidth: 1,
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
  },
  line: { flexDirection: 'row', gap: 8 },
  notes: { color: colors.warn, marginTop: 4 },
  status: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 3 },
});
