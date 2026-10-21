from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def generar_hash(password: str):

    return password_hash.hash(password)


def verificar_password(
    password: str,
    password_guardada: str
):

    try:
        return password_hash.verify(password, password_guardada)
    except Exception:
        # Older SQL exports can contain clear-text or malformed password values.
        return False
