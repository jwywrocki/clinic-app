/**
 * Test email endpoint for admin panel
 * Direct implementation with encrypted password support
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { decryptSensitiveData, isEncrypted } from '@/lib/crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { settings } = body;

        if (!settings?.email_smtp_host || !settings?.email_smtp_port || !settings?.email_smtp_user || !settings?.email_smtp_password || !settings?.email_from_address) {
            return NextResponse.json({ error: 'Brak wymaganych ustawień SMTP' }, { status: 400 });
        }

        // Decrypt password if encrypted
        let smtpPassword = settings.email_smtp_password;
        if (isEncrypted(smtpPassword)) {
            try {
                smtpPassword = decryptSensitiveData(smtpPassword);
            } catch (error) {
                console.error('Failed to decrypt SMTP password:', error);
                return NextResponse.json({ error: 'Błąd deszyfrowania hasła SMTP' }, { status: 400 });
            }
        }

        const transporter = nodemailer.createTransport({
            host: settings.email_smtp_host,
            port: parseInt(settings.email_smtp_port),
            secure: parseInt(settings.email_smtp_port) === 465,
            auth: {
                user: settings.email_smtp_user,
                pass: smtpPassword,
            },
            tls: {
                rejectUnauthorized: settings.email_use_tls === 'true',
            },
        });

        await transporter.verify();

        const mailOptions = {
            from: `${settings.email_from_name || 'System'} <${settings.email_from_address}>`,
            to: settings.email_from_address,
            subject: 'Test konfiguracji email - Klinika',
            html: `
                <h2>Test konfiguracji email</h2>
                <p>Ta wiadomość została wysłana w celu przetestowania konfiguracji SMTP.</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pl-PL')}</p>
                <p><strong>Serwer SMTP:</strong> ${settings.email_smtp_host}:${settings.email_smtp_port}</p>
                <p><strong>Użytkownik:</strong> ${settings.email_smtp_user}</p>
                <p><strong>TLS:</strong> ${settings.email_use_tls === 'true' ? 'Włączony' : 'Wyłączony'}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    Jeśli otrzymałeś tę wiadomość, konfiguracja email działa poprawnie.
                </p>
            `,
            text: `
Test konfiguracji email

Ta wiadomość została wysłana w celu przetestowania konfiguracji SMTP.

Data: ${new Date().toLocaleString('pl-PL')}
Serwer SMTP: ${settings.email_smtp_host}:${settings.email_smtp_port}
Użytkownik: ${settings.email_smtp_user}
TLS: ${settings.email_use_tls === 'true' ? 'Włączony' : 'Wyłączony'}

Jeśli otrzymałeś tę wiadomość, konfiguracja email działa poprawnie.
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'Wiadomość testowa została wysłana pomyślnie',
            messageId: info.messageId,
        });
    } catch (error: any) {
        console.error('Error sending test email:', error);

        let errorMessage = 'Błąd podczas wysyłania wiadomości testowej';

        if (error.code === 'EAUTH') {
            errorMessage = 'Błąd autoryzacji - sprawdź dane logowania SMTP';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Odmowa połączenia - sprawdź adres serwera i port';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Przekroczono czas oczekiwania - sprawdź połączenie sieciowe';
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'Nie znaleziono serwera SMTP - sprawdź adres hosta';
        } else if (error.message) {
            errorMessage = `Błąd SMTP: ${error.message}`;
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.code || 'UNKNOWN_ERROR',
            },
            { status: 500 }
        );
    }
}
