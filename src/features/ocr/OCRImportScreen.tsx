import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, ProgressBar, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { errorMessage, uploadMenuPhoto, type PickedImage } from '@/api/client';
import { useRestaurant } from '@/hooks/data';
import { Panel, Screen } from '@/components/ui';
import { colors } from '@/theme';

const TIPS = [
  'Foto de frente, com o cardápio inteiro no quadro',
  'Boa luz e sem reflexo',
  'Uma página por foto (JPEG ou PNG, até 10 MB)',
];

export default function OCRImportScreen() {
  const nav = useNavigation<any>();
  const { restaurant } = useRestaurant();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    const type = asset.mimeType || 'image/jpeg';
    if (type !== 'image/jpeg' && type !== 'image/png') {
      setError('Use uma foto JPEG ou PNG.');
      return;
    }
    setImage({
      uri: asset.uri,
      name: asset.fileName || (type === 'image/png' ? 'cardapio.png' : 'cardapio.jpg'),
      type,
    });
  };

  const extract = async () => {
    if (!image || !restaurant) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadMenuPhoto(restaurant.id, image);
      if (!result.items.length) {
        setError('Não encontramos itens com preço nesta foto. Tente uma foto mais nítida.');
        return;
      }
      nav.navigate('OCRReview', result);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível ler a foto.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Panel style={{ gap: 8 }}>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>
          Importar cardápio por foto
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.muted }}>
          O OCR lê nomes, preços e categorias. Você revisa tudo antes de entrar no cardápio.
        </Text>
        <View style={{ gap: 6, marginTop: 4 }}>
          {TIPS.map((t) => (
            <View key={t} style={styles.tip}>
              <Icon source="check-circle-outline" size={18} color={colors.ok} />
              <Text variant="bodySmall">{t}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel style={styles.drop}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Icon source="image-text" size={48} color={colors.muted} />
            <Text variant="bodyMedium" style={{ color: colors.muted }}>
              Nenhuma foto escolhida
            </Text>
          </View>
        )}
        {loading ? (
          <View style={{ width: '100%', gap: 6 }}>
            <ProgressBar indeterminate color={colors.brand} />
            <Text variant="bodySmall" style={{ color: colors.muted, textAlign: 'center' }}>
              Lendo o cardápio… pode levar alguns segundos.
            </Text>
          </View>
        ) : null}
      </Panel>

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.buttons}>
        <Button mode="outlined" icon="image" onPress={pick} disabled={loading}>
          {image ? 'Trocar foto' : 'Escolher foto'}
        </Button>
        <Button
          mode="contained"
          icon="text-recognition"
          onPress={extract}
          disabled={!image || loading}
          loading={loading}
        >
          Ler cardápio
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' },
  drop: { alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, gap: 12 },
  placeholder: { alignItems: 'center', gap: 8, height: 200, justifyContent: 'center' },
  preview: { backgroundColor: '#F5EDE4', borderRadius: 8, height: 320, width: '100%' },
  tip: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
