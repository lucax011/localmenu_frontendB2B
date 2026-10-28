import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginForm } from '@/utils/validators';
import { errorMessage, login } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const setSession = useAuthStore((s) => s.setSession);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const res = await login(data.email.trim(), data.password);
      if (res.user.userType !== 'OWNER') {
        setError('Esta conta é de cliente. O painel é para donos de restaurante.');
        return;
      }
      setSession(res.accessToken, res.refreshToken, res.user);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível entrar.'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>LM</Text>
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          LocalMenu para restaurantes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Cardápio, pedidos e vendas num só lugar.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              mode="outlined"
              label="E-mail"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!errors.email}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email?.message}
        </HelperText>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              mode="outlined"
              label="Senha"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!errors.password}
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.password || !!error}>
          {errors.password?.message || error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          contentStyle={{ paddingVertical: 6 }}
        >
          Entrar
        </Button>

        {__DEV__ ? (
          <Text variant="bodySmall" style={styles.hint}>
            Ambiente local: dono@localmenu.dev / localmenu123
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  hint: { color: colors.muted, marginTop: 16, textAlign: 'center' },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    marginBottom: 16,
    width: 52,
  },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  root: { backgroundColor: colors.cream, flex: 1, justifyContent: 'center', padding: 16 },
  subtitle: { color: colors.muted, marginBottom: 20, marginTop: 4 },
  title: { color: colors.ink, fontWeight: '700' },
});
