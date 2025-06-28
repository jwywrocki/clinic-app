'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Table,
    ImageIcon,
    Link as LinkIcon, // Renamed to avoid conflict with HTML Link element
    Palette,
    Paperclip, // Added for file uploads
    Columns,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const presetColors = ['#000000', '#434343', '#666666', '#999999', '#ff0000', '#ff4d00', '#ff9900', '#ffcc00', '#00ff00', '#00ffcc', '#00ccff', '#0099ff', '#0000ff', '#4d00ff', '#9900ff', '#ff00ff'];

const fontSizes = [
    { value: '1', label: '8px' }, // Corresponds to <font size="1"> (typically 8pt or 10px)
    { value: '2', label: '10px' }, // Corresponds to <font size="2"> (typically 10pt or 13px)
    { value: '3', label: '12px' }, // Corresponds to <font size="3"> (typically 12pt or 16px)
    { value: '4', label: '14px' }, // Corresponds to <font size="4"> (typically 14pt or 18px)
    { value: '5', label: '18px' }, // Corresponds to <font size="5"> (typically 18pt or 24px)
    { value: '6', label: '24px' }, // Corresponds to <font size="6"> (typically 24pt or 32px)
    { value: '7', label: '36px' }, // Corresponds to <font size="7"> (typically 36pt or 48px)
];

export function RichTextEditor({ value, onChange, placeholder = 'Wprowadź tekst...', className = '' }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showTableDialog, setShowTableDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showFileDialog, setShowFileDialog] = useState(false);
    const [showColumnsDialog, setShowColumnsDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [imageSourceType, setImageSourceType] = useState<'url' | 'upload'>('url');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [currentLinkUrl, setCurrentLinkUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentFontSize, setCurrentFontSize] = useState('3');
    const [columnsCount, setColumnsCount] = useState(2);

    const [formats, setFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        numberedList: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false,
    });

    // Dodaj stan do śledzenia, czy kursor jest w bloku kolumnowym
    const [inColumnsBlock, setInColumnsBlock] = useState(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);

    const updateFormats = () => {
        setFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            bulletList: document.queryCommandState('insertUnorderedList'),
            numberedList: document.queryCommandState('insertOrderedList'),
            alignLeft: document.queryCommandState('justifyLeft'),
            alignCenter: document.queryCommandState('justifyCenter'),
            alignRight: document.queryCommandState('justifyRight'),
            alignJustify: document.queryCommandState('justifyFull'),
        });
    };

    const exec = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        updateFormats();
    };

    const insertHtmlAtCursor = (html: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
        } else {
            return;
        }

        let range: Range | null = null;
        const selection = window.getSelection();

        if (savedRangeRef.current && editorRef.current?.contains(savedRangeRef.current.commonAncestorContainer)) {
            range = savedRangeRef.current;
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else if (selection && selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            if (editorRef.current && !editorRef.current.contains(range.commonAncestorContainer)) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        } else if (editorRef.current) {
            range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        if (!range) {
            console.error('Could not determine a valid range for insertion.');
            return;
        }

        savedRangeRef.current = null;

        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const fragment = document.createDocumentFragment();
        let lastNode;

        while (tempDiv.firstChild) {
            lastNode = fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);

        if (lastNode) {
            const newRange = document.createRange();
            newRange.setStartAfter(lastNode);
            newRange.collapse(true);
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(newRange);
            }

            if (lastNode instanceof HTMLElement) {
                lastNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML || '');
        }
    };

    // Format handlers
    const toggleFormat = (format: string) => {
        editorRef.current?.focus();
        exec(format);
        onChange(editorRef.current?.innerHTML || '');
    };

    const toggleList = (type: 'ul' | 'ol') => {
        editorRef.current?.focus();
        exec(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
        onChange(editorRef.current?.innerHTML || '');
    };

    const applyAlignment = (alignment: string) => {
        editorRef.current?.focus();
        exec(alignment);
        onChange(editorRef.current?.innerHTML || '');
    };

    const applyFontSize = (size: string) => {
        editorRef.current?.focus();
        document.execCommand('fontSize', false, size);
        setCurrentFontSize(size);
        onChange(editorRef.current?.innerHTML || '');
    };

    const applyColor = (color: string) => {
        editorRef.current?.focus();
        document.execCommand('foreColor', false, color);
        setCurrentColor(color);
        setShowColorPicker(false);
        onChange(editorRef.current?.innerHTML || '');
    };

    const applyLink = (url: string) => {
        if (!url) return;
        editorRef.current?.focus();

        const selection = window.getSelection();
        if (!selection) {
            setShowLinkDialog(false);
            setCurrentLinkUrl('');
            savedRangeRef.current = null;
            return;
        }

        if (savedRangeRef.current && editorRef.current?.contains(savedRangeRef.current.commonAncestorContainer)) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }

        document.execCommand('createLink', false, url);
        setShowLinkDialog(false);
        setCurrentLinkUrl('');
        onChange(editorRef.current?.innerHTML || '');
        savedRangeRef.current = null;
    };

    const insertImage = (url: string) => {
        if (!url) return;
        const imageHtml = `<img src="${url}" alt="${imageAlt || ''}" class="editor-image">`;
        insertHtmlAtCursor(imageHtml);
        setImageUrl('');
        setImageAlt('');
        setSelectedImageFile(null);
        setImageSourceType('url');
        setShowImageDialog(false);
    };

    const insertFileLink = (fileName: string, fileUrl: string) => {
        if (!fileName || !fileUrl) return;
        const fileHtml = `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${fileName}</a>`;
        insertHtmlAtCursor(fileHtml);
        setShowFileDialog(false);
        setSelectedFile(null);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            if (data.filePath) {
                insertFileLink(selectedFile.name, data.filePath);
            } else {
                console.error('File path not returned from server');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleImageFileUpload = async () => {
        if (!selectedImageFile) return;
        setImageUploadError(null);
        const formData = new FormData();
        formData.append('file', selectedImageFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            let errorData = null;
            if (!response.ok) {
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: response.statusText };
                }
                if (errorData && errorData.error && errorData.error.includes('File size')) {
                    setImageUploadError('Plik jest zbyt duży (maksymalnie 5MB).');
                } else if (errorData && errorData.error) {
                    setImageUploadError(errorData.error);
                } else {
                    setImageUploadError('Błąd podczas przesyłania obrazu.');
                }
                console.error('Image upload failed', errorData?.error || response.statusText);
                return;
            }
            const data = await response.json();
            if (data.filePath) {
                insertImage(data.filePath);
            } else {
                setImageUploadError('Serwer nie zwrócił ścieżki do pliku.');
                console.error('File path not returned from server for image upload');
            }
        } catch (error) {
            // Nie rzucaj błędu, tylko loguj i ustaw komunikat
            if (!imageUploadError) setImageUploadError('Błąd podczas przesyłania obrazu.');
            console.error('Error uploading image file:', error);
            // Nie rzucaj dalej!
        }
    };

    const insertTable = (rows: number, cols: number) => {
        let tableHtml = '';

        if (rows === 3 && cols === 3) {
            tableHtml = `<table class="editor-table"><tbody>
<tr><th class="editor-th">Nagłówek 1</th><th class="editor-th">Nagłówek 2</th><th class="editor-th">Nagłówek 3</th></tr>
<tr><td class="editor-td">Komórka 1-1</td><td class="editor-td">Komórka 1-2</td><td class="editor-td">Komórka 1-3</td></tr>
<tr><td class="editor-td">Komórka 2-1</td><td class="editor-td">Komórka 2-2</td><td class="editor-td">Komórka 2-3</td></tr>
</tbody></table><p></p>`;
        } else {
            tableHtml = '<table class="editor-table"><tbody>';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    if (i === 0) {
                        tableHtml += `<th class="editor-th">Nagłówek ${j + 1}</th>`;
                    } else {
                        tableHtml += `<td class="editor-td">Komórka ${i}-${j + 1}</td>`;
                    }
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table><p></p>';
        }

        insertHtmlAtCursor(tableHtml);
        setShowTableDialog(false);
    };

    const insertColumns = (count: number) => {
        let selectedHtml = '';
        const selection = window.getSelection();

        if (savedRangeRef.current && selection) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(range.cloneContents());
            selectedHtml = tempDiv.innerHTML;
            range.deleteContents();
        }

        savedRangeRef.current = null;
        let columnsHtml = `<div class=\"editor-columns columns-${count}\">`;
        columnsHtml += `<div class=\"editor-column\">${selectedHtml || ''}</div>`;
        for (let i = 2; i <= count; i++) {
            columnsHtml += `<div class=\"editor-column\"></div>`;
        }
        columnsHtml += '</div><p></p>';
        insertHtmlAtCursor(columnsHtml);
        setShowColumnsDialog(false);
        setTimeout(() => {
            if (!editorRef.current) return;
            const columnsBlock = editorRef.current.querySelector('.editor-columns');
            if (columnsBlock) {
                const firstCol = columnsBlock.querySelector('.editor-column');
                if (firstCol) {
                    const range = document.createRange();
                    range.selectNodeContents(firstCol);
                    range.collapse(false);
                    const sel = window.getSelection();
                    if (sel) {
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
        }, 0);
    };

    useEffect(() => {
        if (!editorRef.current) return;
        const columns = editorRef.current.querySelectorAll('.editor-column');
        columns.forEach((col) => {
            if (col.innerHTML.trim() === '') {
                col.setAttribute('data-placeholder', 'Kolumna');
            } else {
                col.removeAttribute('data-placeholder');
            }
        });
    }, [value, editorRef.current]);

    const removeColumnsAtSelection = () => {
        if (!editorRef.current) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        let node = selection.anchorNode as HTMLElement | null;

        while (node && node !== editorRef.current) {
            if (node.nodeType === 1 && (node as HTMLElement).classList.contains('editor-columns')) {
                const parent = node.parentNode;
                if (parent) {
                    const columns = Array.from(node.childNodes)
                        .map((col) => (col as HTMLElement).innerHTML)
                        .join('<br><br>');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = columns;
                    parent.replaceChild(tempDiv, node);
                    onChange(editorRef.current.innerHTML || '');
                }
                break;
            }
            node = node.parentNode as HTMLElement | null;
        }
    };

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current) {
                updateFormats();
                const fontSize = document.queryCommandValue('fontSize');
                if (fontSize && fontSizes.some((fs) => fs.value === fontSize)) {
                    setCurrentFontSize(fontSize);
                }

                const selection = window.getSelection();
                let node = selection && (selection.anchorNode as HTMLElement | null);
                let found = false;
                while (node && node !== editorRef.current) {
                    if (node.nodeType === 1 && (node as HTMLElement).classList.contains('editor-columns')) {
                        found = true;
                        break;
                    }
                    node = node.parentNode as HTMLElement | null;
                }
                setInColumnsBlock(found);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                let node = selection.anchorNode as Node | null;
                let inColumn = false;
                let columnNode: HTMLElement | null = null;
                while (node && node !== editor) {
                    if (node.nodeType === 1 && (node as HTMLElement).classList.contains('editor-column')) {
                        inColumn = true;
                        columnNode = node as HTMLElement;
                        break;
                    }
                    node = (node as HTMLElement).parentNode;
                }
                if (inColumn && columnNode) {
                    e.preventDefault();
                    const sel = window.getSelection();

                    if (!sel) return;

                    const range = sel.getRangeAt(0);
                    const br1 = document.createElement('br');
                    const br2 = document.createElement('br');

                    range.insertNode(br2);
                    range.insertNode(br1);
                    range.setStartAfter(br2);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    setTimeout(() => {
                        const columnsParent = columnNode!.parentElement;
                        if (columnsParent && columnsParent.classList.contains('editor-columns')) {
                            const columns = Array.from(columnsParent.children);
                            columns.forEach((col) => {
                                if (col !== columnNode && col.classList.contains('editor-column') && col.innerHTML.replace(/<br\s*\/?>(\s*)?/g, '').trim() === '') {
                                    columnsParent.removeChild(col);
                                }
                            });
                        }
                    }, 0);
                }
            }
        };
        editor.addEventListener('keydown', handleKeyDown);
        return () => editor.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML && value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setImageUploadError(null);
        if (file && file.size > MAX_IMAGE_SIZE) {
            setSelectedImageFile(null);
            setImageUploadError('Plik jest zbyt duży (maksymalnie 5MB).');
        } else {
            setSelectedImageFile(file);
        }
    };

    return (
        <>
            <style jsx global>{`
                .editor-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                    border: 1px solid #e5e7eb;
                }
                .editor-columns {
                    display: flex;
                    gap: 1.5rem;
                    margin: 1em 0;
                }
                .editor-columns > .editor-column {
                    flex: 1 1 0;
                    min-width: 0;
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background: #fafbfc;
                }

                .editor-image {
                    max-width: 100%;
                    height: auto;
                    margin: 1em 0;
                    display: block;
                }

                .editor-content ul {
                    list-style-type: disc;
                    margin: 1em 0;
                    padding-left: 2em;
                }

                .editor-content ol {
                    list-style-type: decimal;
                    margin: 1em 0;
                    padding-left: 2em;
                }

                .editor-content li {
                    margin: 0.5em 0;
                }

                .editor-column:empty:before {
                    content: attr(data-placeholder);
                    color: #bdbdbd;
                    font-style: italic;
                    pointer-events: none;
                }
            `}</style>

            <Card className={`w-full ${className}`}>
                <div role="toolbar" aria-label="Opcje formatowania" className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b rounded-t-lg">
                    <div className="flex items-center gap-1">
                        <Button type="button" variant={formats.bold ? 'default' : 'outline'} size="sm" onClick={() => toggleFormat('bold')} title="Pogrubienie">
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.italic ? 'default' : 'outline'} size="sm" onClick={() => toggleFormat('italic')} title="Kursywa">
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.underline ? 'default' : 'outline'} size="sm" onClick={() => toggleFormat('underline')} title="Podkreślenie">
                            <Underline className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={inColumnsBlock ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                if (inColumnsBlock) {
                                    removeColumnsAtSelection();
                                } else {
                                    const selection = window.getSelection();
                                    if (selection && selection.rangeCount > 0) {
                                        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                                    }
                                    setShowColumnsDialog(true);
                                }
                            }}
                            title={inColumnsBlock ? 'Usuń blok kolumnowy' : 'Wstaw kolumny tekstu'}
                        >
                            <Columns className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <div className="flex items-center gap-1">
                        <Button type="button" variant={formats.bulletList ? 'default' : 'outline'} size="sm" onClick={() => toggleList('ul')} title="Lista punktowana">
                            <List className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.numberedList ? 'default' : 'outline'} size="sm" onClick={() => toggleList('ol')} title="Lista numerowana">
                            <ListOrdered className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <div className="flex items-center gap-1">
                        <Button type="button" variant={formats.alignLeft ? 'default' : 'outline'} size="sm" onClick={() => applyAlignment('justifyLeft')} title="Wyrównaj do lewej">
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.alignCenter ? 'default' : 'outline'} size="sm" onClick={() => applyAlignment('justifyCenter')} title="Wyśrodkuj">
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.alignRight ? 'default' : 'outline'} size="sm" onClick={() => applyAlignment('justifyRight')} title="Wyrównaj do prawej">
                            <AlignRight className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant={formats.alignJustify ? 'default' : 'outline'} size="sm" onClick={() => applyAlignment('justifyFull')} title="Wyjustuj">
                            <AlignJustify className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    savedRangeRef.current = selection.getRangeAt(0);
                                }
                                setShowTableDialog(true);
                            }}
                            title="Wstaw tabelę"
                        >
                            <Table className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                                }
                                setShowImageDialog(true);
                            }}
                            title="Wstaw obraz"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                                    const selectedText = selection.toString().trim();
                                    if (selectedText.startsWith('http://') || selectedText.startsWith('https://')) {
                                        setCurrentLinkUrl(selectedText);
                                    } else {
                                        setCurrentLinkUrl('');
                                    }
                                } else {
                                    setCurrentLinkUrl('');
                                }
                                setShowLinkDialog(true);
                            }}
                            title="Wstaw hiperłącze"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowColorPicker(true)} title="Kolor tekstu" className="relative">
                            <Palette className="h-4 w-4" />
                            <span className="absolute bottom-1 right-1 block w-2 h-2 rounded-full border border-gray-400" style={{ backgroundColor: currentColor }} />
                        </Button>
                        <select
                            value={currentFontSize}
                            onChange={(e) => applyFontSize(e.target.value)}
                            className="h-11 px-3 rounded-md border border-input bg-background text-sm"
                            title="Rozmiar czcionki"
                        >
                            {fontSizes.map((size) => (
                                <option key={size.value} value={size.value}>
                                    {size.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="relative">
                    <div
                        ref={editorRef}
                        contentEditable
                        className="editor-content min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>table]:border-collapse [&>table]:border [&>table]:border-gray-300 [&>table]:w-full [&>table_td]:border [&>table_td]:border-gray-300 [&>table_td]:p-2 [&>table_th]:border [&>table_th]:border-gray-300 [&>table_th]:p-2 [&>img]:max-w-full [&>img]:h-auto"
                        onInput={() => onChange(editorRef.current?.innerHTML || '')}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Edytor tekstu"
                    />
                    {!isFocused && !value && <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">{placeholder}</div>}
                </div>
            </Card>

            {/* Table Dialog */}
            <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wstaw tabelę</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rows" className="text-right">
                                Wiersze
                            </Label>
                            <Input id="rows" type="number" min="1" max="10" value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cols" className="text-right">
                                Kolumny
                            </Label>
                            <Input id="cols" type="number" min="1" max="10" value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTableDialog(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={() => insertTable(tableRows, tableCols)}>Wstaw</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Color Dialog */}
            <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wybierz kolor</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-2 py-4">
                        {presetColors.map((color) => (
                            <button
                                key={color}
                                className={`w-10 h-10 rounded-md border-2 ${currentColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => applyColor(color)}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <Label htmlFor="custom-color">Własny kolor:</Label>
                        <Input id="custom-color" type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="w-20" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowColorPicker(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={() => applyColor(currentColor)}>Zastosuj</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog
                open={showImageDialog}
                onOpenChange={(isOpen) => {
                    setShowImageDialog(isOpen);
                    if (!isOpen) {
                        setImageUrl('');
                        setImageAlt('');
                        setSelectedImageFile(null);
                        setImageSourceType('url');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wstaw obraz</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <input type="radio" id="image-source-url" name="imageSource" value="url" checked={imageSourceType === 'url'} onChange={() => setImageSourceType('url')} />
                            <Label htmlFor="image-source-url">Z adresu URL</Label>
                            <input type="radio" id="image-source-upload" name="imageSource" value="upload" checked={imageSourceType === 'upload'} onChange={() => setImageSourceType('upload')} />
                            <Label htmlFor="image-source-upload">Prześlij plik</Label>
                        </div>

                        {imageSourceType === 'url' && (
                            <div className="col-span-4 items-center gap-4">
                                <Label htmlFor="image-url" className="text-right">
                                    URL obrazu
                                </Label>
                                <Input id="image-url" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="col-span-3" />
                            </div>
                        )}

                        {imageSourceType === 'upload' && (
                            <div className="col-span-4 items-center gap-4">
                                <Label htmlFor="image-file" className="text-right">
                                    Plik obrazu
                                </Label>
                                <Input id="image-file" type="file" accept="image/*" onChange={handleImageFileChange} className="col-span-3" />
                            </div>
                        )}
                        {imageSourceType === 'upload' && <div className="col-span-4 text-xs text-gray-500 mb-2">Maksymalny rozmiar pliku: 5MB</div>}
                        {imageUploadError && <div className="col-span-4 text-red-500 text-sm mb-2">{imageUploadError}</div>}

                        <div className="col-span-4 items-center gap-4">
                            <Label htmlFor="image-alt" className="text-right">
                                Tekst alternatywny
                            </Label>
                            <Input id="image-alt" type="text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Opis obrazu" className="col-span-3" />
                        </div>

                        {imageSourceType === 'url' && imageUrl && (
                            <div className="col-span-4">
                                <p className="text-sm text-gray-500 mb-2">Podgląd:</p>
                                <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    className="max-w-full h-auto max-h-40 rounded border"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.insertAdjacentHTML('afterend', '<p class="text-red-500 text-center p-2">Nie można załadować obrazu</p>');
                                    }}
                                />
                            </div>
                        )}
                        {imageSourceType === 'upload' && selectedImageFile && (
                            <div className="col-span-4">
                                <p className="text-sm text-gray-500 mb-2">Podgląd:</p>
                                <img src={URL.createObjectURL(selectedImageFile)} alt={imageAlt} className="max-w-full h-auto max-h-40 rounded border" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowImageDialog(false);
                                setImageUrl('');
                                setImageAlt('');
                                setSelectedImageFile(null);
                                setImageSourceType('url');
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button
                            onClick={() => {
                                if (imageSourceType === 'url') {
                                    insertImage(imageUrl);
                                } else if (imageSourceType === 'upload') {
                                    handleImageFileUpload();
                                }
                            }}
                            disabled={imageSourceType === 'url' ? !imageUrl.trim() : !selectedImageFile}
                        >
                            Wstaw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* File Dialog */}
            <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wstaw plik</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file-upload" className="text-right">
                                Plik
                            </Label>
                            <Input id="file-upload" type="file" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
                        </div>
                        {selectedFile && (
                            <div className="col-span-4">
                                <p className="text-sm text-gray-500">Wybrany plik: {selectedFile.name}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowFileDialog(false);
                                setSelectedFile(null);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button onClick={handleFileUpload} disabled={!selectedFile}>
                            Wstaw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Columns Dialog */}
            <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wstaw kolumny tekstu</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="columns-count" className="text-right">
                                Liczba kolumn
                            </Label>
                            <Input id="columns-count" type="number" min="2" max="3" value={columnsCount} onChange={(e) => setColumnsCount(Number(e.target.value))} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowColumnsDialog(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={() => insertColumns(columnsCount)}>Wstaw</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Link Dialog */}
            <Dialog
                open={showLinkDialog}
                onOpenChange={(isOpen) => {
                    setShowLinkDialog(isOpen);
                    if (!isOpen) {
                        setCurrentLinkUrl('');
                        savedRangeRef.current = null;
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wstaw hiperłącze</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link-url" className="text-right">
                                Adres URL
                            </Label>
                            <Input id="link-url" type="url" value={currentLinkUrl} onChange={(e) => setCurrentLinkUrl(e.target.value)} placeholder="https://example.com" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowLinkDialog(false);
                                setCurrentLinkUrl('');
                                savedRangeRef.current = null;
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button onClick={() => applyLink(currentLinkUrl)} disabled={!currentLinkUrl.trim()}>
                            Wstaw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
