// components/common/CountdownTimer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

export default function CountdownTimer({ seconds, onTick, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onTickRef = useRef(onTick);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef(null);

  // Atualizar as refs quando as callbacks mudarem
  useEffect(() => {
    onTickRef.current = onTick;
    onExpireRef.current = onExpire;
  }, [onTick, onExpire]);

  // ✅ Função para formatar o tempo
  const formatTime = useCallback(totalSeconds => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  // ✅ EFEITO PRINCIPAL DO TIMER
  useEffect(() => {
    // Se o tempo acabou, não iniciar timer
    if (timeLeft <= 0) {
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    // Iniciar o intervalo
    intervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;

        // ✅ Chamar onTick APÓS o estado ser calculado
        // Usar setTimeout para evitar setState durante a renderização
        if (onTickRef.current && newTime >= 0) {
          // Usar requestAnimationFrame para garantir que não está em fase de render
          requestAnimationFrame(() => {
            onTickRef.current(newTime);
          });
        }

        return newTime;
      });
    }, 1000);

    // Cleanup do intervalo
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft]); // ✅ Dependência correta - só recria se timeLeft <= 0 mudar

  // ✅ Limpeza final ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const isUrgent = timeLeft < 300; // menos de 5 minutos

  return (
    <View>
      <Text style={[styles.timerText, isUrgent && styles.timerUrgent]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
}
