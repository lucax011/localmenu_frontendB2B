import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Paragraph, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { extractFromImage } from '@/api/ocr';
import { useNavigation } from '@react-navigation/native';

export default function OCRImportScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickAndExtract = async () => {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName || 'file',
      type: asset.mimeType || 'application/octet-stream',
    };
    setLoading(true);
    try {
      const data = await extractFromImage(file);
      nav.navigate('OCRReview', { items: data.items });
    } catch (e: any) {
      setError(e?.message || 'Falha ao extrair dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Importar Cardápio</Title>
      <Paragraph style={{ marginBottom: 12 }}>
        Selecione uma imagem ou PDF simples do seu cardápio para extração via OCR.
      </Paragraph>
      {error ? <Paragraph style={{ color: 'red' }}>{error}</Paragraph> : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button mode="contained" onPress={handlePickAndExtract} loading={loading}>
          Selecionar e Extrair
        </Button>
      </View>
    </ScrollView>
  );
}
