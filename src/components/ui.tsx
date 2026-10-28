import React from 'react';
import { RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { colors } from '@/theme';

// Conteúdo rolável com largura máxima, para ficar bom no celular e no navegador
export function Screen({
  children,
  refreshing,
  onRefresh,
  footer,
}: {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        <View style={styles.column}>{children}</View>
      </ScrollView>
      {footer}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {children}
      </Text>
      {right}
    </View>
  );
}

export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="labelMedium" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Text variant="titleMedium">{title}</Text>
      {text ? (
        <Text
          variant="bodyMedium"
          style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}
        >
          {text}
        </Text>
      ) : null}
    </Panel>
  );
}

export function ConfirmDialog({
  visible,
  title,
  text,
  confirmLabel = 'Confirmar',
  danger,
  loading,
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{text}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Voltar</Button>
          <Button
            mode="contained"
            buttonColor={danger ? colors.danger : undefined}
            loading={loading}
            onPress={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export const styles = StyleSheet.create({
  column: { alignSelf: 'center', gap: 12, maxWidth: 760, width: '100%' },
  dialog: { alignSelf: 'center', maxWidth: 440, width: '92%' },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  root: { backgroundColor: colors.cream, flex: 1 },
  scroll: { padding: 16, paddingBottom: 96 },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: { color: colors.ink, fontWeight: '700' },
  stat: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    padding: 14,
  },
  statValue: { color: colors.ink, fontWeight: '700', marginTop: 2 },
});
