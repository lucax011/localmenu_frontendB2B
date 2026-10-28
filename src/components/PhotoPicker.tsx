import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { errorMessage, imageSrc, uploadImage } from '@/api/client';
import { colors } from '@/theme';

// Escolhe uma foto, envia na hora para /uploads/image e devolve a URL.
// A URL só vale depois que a tela salvar o item ou o restaurante.
export default function PhotoPicker({
  value,
  onChange,
  label,
  aspectRatio = 4 / 3,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  aspectRatio?: number;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = imageSrc(value);

  const pick = async () => {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: aspectRatio > 1.5 ? [16, 9] : [4, 3],
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    const type = asset.mimeType || 'image/jpeg';
    if (type !== 'image/jpeg' && type !== 'image/png') {
      setError('Use uma foto JPEG ou PNG.');
      return;
    }
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setError('A foto passa de 5 MB. Escolha uma menor.');
      return;
    }
    setSending(true);
    try {
      const url = await uploadImage({
        uri: asset.uri,
        name: asset.fileName || (type === 'image/png' ? 'foto.png' : 'foto.jpg'),
        type,
      });
      onChange(url);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível enviar a foto.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      <Text variant="labelLarge" style={{ color: colors.ink }}>
        {label}
      </Text>
      <Pressable
        onPress={pick}
        disabled={sending}
        accessibilityRole="button"
        accessibilityLabel={
          src ? `Trocar ${label.toLowerCase()}` : `Escolher ${label.toLowerCase()}`
        }
        style={[styles.box, { aspectRatio }]}
      >
        {src ? (
          <Image source={{ uri: src }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.empty}>
            <Icon source="camera-plus-outline" size={32} color={colors.muted} />
            <Text variant="bodySmall" style={{ color: colors.muted, textAlign: 'center' }}>
              {sending ? 'Enviando…' : 'Toque para escolher uma foto\nJPEG ou PNG, até 5 MB'}
            </Text>
          </View>
        )}
      </Pressable>
      {src ? (
        <View style={styles.actions}>
          <Button compact icon="image-edit-outline" onPress={pick} loading={sending}>
            Trocar
          </Button>
          <Button compact textColor={colors.danger} onPress={() => onChange(null)}>
            Remover
          </Button>
        </View>
      ) : null}
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  box: {
    backgroundColor: '#F5EDE4',
    borderColor: colors.line,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  empty: { alignItems: 'center', flex: 1, gap: 6, justifyContent: 'center', padding: 16 },
});
