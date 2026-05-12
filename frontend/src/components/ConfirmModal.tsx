import { Button, Modal } from "react-bootstrap"

interface Props {
    show: boolean
    titulo: string
    mensaje: string
    labelConfirmar?: string
    onConfirmar: () => void
    onCancelar: () => void
}

export function ConfirmModal({ show, titulo, mensaje, labelConfirmar = 'Confirmar', onConfirmar, onCancelar }: Props) {
    return (
        <Modal show={show} onHide={onCancelar} centered>
            <Modal.Header closeButton>
                <Modal.Title>{titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{mensaje}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancelar}>
                    Go back
                </Button>
                <Button variant="danger" onClick={onConfirmar}>
                    {labelConfirmar}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
