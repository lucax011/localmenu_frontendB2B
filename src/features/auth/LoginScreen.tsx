import React from 'react';
import { View } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginForm } from '@/utils/validators';
import { login } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data: LoginForm) => {
    const res = await login(data.email, data.password);
    setAuth(res.token, res.businessId);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Title style={{ marginBottom: 16 }}>Entrar</Title>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ marginBottom: 8 }}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Senha"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={{ marginBottom: 16 }}
          />
        )}
      />
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
        Entrar
      </Button>
    </View>
  );
}
