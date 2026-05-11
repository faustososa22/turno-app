import { Toast, ToastContainer } from "react-bootstrap"

interface Props {
    show: boolean
    message: string
    variant?: 'success' | 'danger'
    onClose: () => void
}

export function AppToast({ show, message, variant = 'success', onClose }: Props) {
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            <Toast show={show} onClose={onClose} delay={3000} autohide bg={variant}>
                <Toast.Body className="text-white fw-semibold">
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    )
}
