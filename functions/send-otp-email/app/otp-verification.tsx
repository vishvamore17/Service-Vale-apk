import { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { StackScreenProps } from '@react-navigation/stack';

type RootStackParamList = {
    OtpVerification: { email: string };
    ResetPassword: { email: string };
};

type OtpVerificationScreenProps = StackScreenProps<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = ({ route, navigation }: OtpVerificationScreenProps) => {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [generatedOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

    const handleVerifyOTP = () => {
        if (otp === '') {
            Alert.alert('Error', 'Please enter the OTP');
        } else if (otp !== generatedOtp) {
            Alert.alert('Error', 'Invalid OTP. Please try again.');
        } else {
            navigation.navigate('ResetPassword', { email });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
                Enter the 6-digit OTP sent to {email}
            </Text>
            
            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#999"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
            />
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleVerifyOTP}
            >
                <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 18,
        textAlign: 'center',
    },
    button: {
        height: 50,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OtpVerificationScreen;