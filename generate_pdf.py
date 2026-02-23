# -*- coding: utf-8 -*-
# generate_pdf.py
import re, os
from fpdf import FPDF

FONT_DIR = 'C:/Windows/Fonts/'
FONTS = {
    ('Arial',    ''):   FONT_DIR + 'arial.ttf',
    ('Arial',    'B'):  FONT_DIR + 'arialbd.ttf',
    ('Arial',    'I'):  FONT_DIR + 'ariali.ttf',
    ('Arial',    'BI'): FONT_DIR + 'arialbi.ttf',
    ('Consolas', ''):   FONT_DIR + 'consola.ttf',
    ('Consolas', 'B'):  FONT_DIR + 'consolab.ttf',
    ('Consolas', 'I'):  FONT_DIR + 'consolai.ttf',
}
print("part1 ok")
DARK_BG      = (30,  39,  53)
H2_COLOR     = (30,  39,  53)
H3_COLOR     = (52,  73,  94)
BODY_COLOR   = (33,  37,  41)
SUBTLE_COLOR = (108, 117, 125)
CODE_BG      = (248, 249, 250)
CODE_FG      = (39,  103,  73)
RULE_COLOR   = (173, 181, 189)
TABLE_HDR_BG = (52,  73,  94)
TABLE_HDR_FG = (255, 255, 255)
TABLE_ROW_BG = (255, 255, 255)
TABLE_ALT_BG = (248, 249, 250)
TABLE_BORDER = (206, 212, 218)
PAGE_W  = 210
MARGIN  = 18
CONTENT = PAGE_W - 2 * MARGIN


class MarkdownPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(MARGIN, 18, MARGIN)
        for (name, style), path in FONTS.items():
            self.add_font(name, style, path)

    def header(self):
        pass

    def footer(self):
        self.set_y(-14)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(*SUBTLE_COLOR)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')
        self.set_text_color(*BODY_COLOR)

    def draw_h1_banner(self, text):
        bh = 18
        self.set_fill_color(*DARK_BG)
        self.rect(0, self.get_y(), PAGE_W, bh, 'F')
        self.set_font('Arial', 'B', 16)
        self.set_text_color(255, 255, 255)
        y0 = self.get_y()
        self.set_xy(MARGIN, y0 + 1)
        self.cell(CONTENT, bh - 2, text, align='L')
        self.set_text_color(*BODY_COLOR)
        self.ln(bh + 4)

    def draw_h2(self, text):
        self.ln(4)
        bar_h = 9
        y0 = self.get_y()
        if y0 + bar_h + 6 > self.page_break_trigger:
            self.add_page()
            y0 = self.get_y()
        self.set_fill_color(*DARK_BG)
        self.rect(MARGIN, y0, 3, bar_h, 'F')
        self.set_font('Arial', 'B', 14)
        self.set_text_color(*H2_COLOR)
        self.set_xy(MARGIN + 5, y0)
        self.cell(CONTENT - 5, bar_h, text, align='L')
        self.set_text_color(*BODY_COLOR)
        self.set_draw_color(*H2_COLOR)
        self.set_line_width(0.4)
        self.line(MARGIN, y0 + bar_h + 1, MARGIN + CONTENT, y0 + bar_h + 1)
        self.set_draw_color(*RULE_COLOR)
        self.ln(bar_h + 4)

    def draw_h3(self, text):
        self.ln(2)
        self.set_font('Arial', 'B', 12)
        self.set_text_color(*H3_COLOR)
        self.cell(CONTENT, 8, text, align='L')
        self.set_text_color(*BODY_COLOR)
        self.ln(9)

    def draw_h4(self, text):
        self.set_font('Arial', 'BI', 10)
        self.set_text_color(*H3_COLOR)
        self.cell(CONTENT, 6, text, align='L')
        self.set_text_color(*BODY_COLOR)
        self.ln(7)

    def write_paragraph(self, text, font_size=10, line_height=5.5,
                         left_indent=0, color=None):
        if color is None:
            color = BODY_COLOR
        self.set_text_color(*color)
        self.set_x(MARGIN + left_indent)
        for (bold, italic, seg_text) in parse_inline(text):
            if bold and italic:   style = 'BI'
            elif bold:            style = 'B'
            elif italic:          style = 'I'
            else:                 style = ''
            self.set_font('Arial', style, font_size)
            self.write(line_height, seg_text)
        self.ln(line_height + 1)
        self.set_text_color(*BODY_COLOR)

    def write_bullet(self, text, level=0, font_size=10):
        indent   = 4 + level * 6
        bullet_x = MARGIN + indent
        self.set_x(bullet_x)
        self.set_font('Arial', '', font_size)
        self.cell(4, 5.5, chr(8226), align='L')
        self.set_x(bullet_x + 4)
        for (bold, italic, seg_text) in parse_inline(text):
            style = 'B' if bold else ('I' if italic else '')
            self.set_font('Arial', style, font_size)
            self.write(5.5, seg_text)
        self.ln(6)

    def draw_hr(self):
        self.ln(3)
        self.set_draw_color(*RULE_COLOR)
        self.set_line_width(0.5)
        y = self.get_y()
        self.line(MARGIN, y, MARGIN + CONTENT, y)
        self.ln(5)

    def draw_code_block(self, code_lines_list):
        self.ln(2)
        pad    = 3
        line_h = 4.5
        total_h = len(code_lines_list) * line_h + 2 * pad
        if self.get_y() + total_h > self.page_break_trigger:
            self.add_page()
        y0 = self.get_y()
        self.set_fill_color(*CODE_BG)
        self.set_draw_color(*RULE_COLOR)
        self.set_line_width(0.3)
        self.rect(MARGIN, y0, CONTENT, total_h, 'DF')
        self.set_fill_color(*H2_COLOR)
        self.rect(MARGIN, y0, 2, total_h, 'F')
        self.set_font('Consolas', '', 8.5)
        self.set_text_color(*CODE_FG)
        self.set_xy(MARGIN + 4, y0 + pad)
        for cl in code_lines_list:
            self.set_x(MARGIN + 4)
            self.cell(CONTENT - 6, line_h, cl, align='L')
            self.ln(line_h)
        self.set_text_color(*BODY_COLOR)
        self.ln(pad + 2)

    def draw_blockquote(self, text):
        self.ln(2)
        self.set_fill_color(232, 240, 254)
        self.set_draw_color(108, 142, 191)
        self.set_line_width(0.4)
        y0 = self.get_y()
        clean = re.sub(r'\*+', '', text)
        chars_per_line = max(1, int((CONTENT - 12) / 1.65))
        n_lines = max(1, (len(clean) // chars_per_line) + 1)
        bh = n_lines * 5.5 + 6
        self.rect(MARGIN, y0, CONTENT, bh, 'DF')
        self.set_fill_color(*DARK_BG)
        self.rect(MARGIN, y0, 2.5, bh, 'F')
        self.set_xy(MARGIN + 5, y0 + 3)
        self.set_text_color(50, 80, 130)
        for (bold, italic, seg_text) in parse_inline(text):
            style = 'BI' if bold and italic else ('B' if bold else 'I')
            self.set_font('Arial', style, 9.5)
            self.write(5.5, seg_text)
        self.set_text_color(*BODY_COLOR)
        self.set_y(y0 + bh + 2)

    def draw_table(self, rows):
        if not rows:
            return
        self.ln(3)
        n_cols = max(len(r) for r in rows)
        if n_cols == 0:
            return
        col_w  = CONTENT / n_cols
        row_h  = 6.5
        self.set_line_width(0.2)
        for r_idx, row in enumerate(rows):
            if self.get_y() + row_h > self.page_break_trigger:
                self.add_page()
            if r_idx == 0:
                self.set_fill_color(*TABLE_HDR_BG)
                self.set_text_color(*TABLE_HDR_FG)
                self.set_font('Arial', 'B', 9)
            else:
                bg = TABLE_ROW_BG if r_idx % 2 == 1 else TABLE_ALT_BG
                self.set_fill_color(*bg)
                self.set_text_color(*BODY_COLOR)
                self.set_font('Arial', '', 9)
            self.set_draw_color(*TABLE_BORDER)
            x0, y0 = MARGIN, self.get_y()
            self.rect(x0, y0, CONTENT, row_h, 'DF')
            for c_idx in range(n_cols):
                cell_text = row[c_idx].strip() if c_idx < len(row) else ''
                cell_text = re.sub(r'\*\*(.*?)\*\*', r'\1', cell_text)
                cell_text = re.sub(r'\*(.*?)\*',       r'\1', cell_text)
                self.set_xy(x0 + c_idx * col_w + 1.5, y0 + 0.5)
                self.cell(col_w - 3, row_h - 1, cell_text, align='L')
            self.ln(row_h)
        self.ln(3)


def parse_inline(text):
    segments = []
    TICK = chr(96)
    pattern = re.compile(
        TICK + r'([^' + TICK + r']+)' + TICK
        + r'|[*][*][*](.+?)[*][*][*]'
        + r'|[*][*](.+?)[*][*]'
        + r'|[*](.+?)[*]'
        + r'|([^' + TICK + r'*]*)(?=[' + TICK + r'*]|$)'
    )
    for m in pattern.finditer(text):
        g = m.groups()
        if   g[0] is not None and g[0]: segments.append((False, False, g[0]))
        elif g[1] is not None:          segments.append((True,  True,  g[1]))
        elif g[2] is not None:          segments.append((True,  False, g[2]))
        elif g[3] is not None:          segments.append((False, True,  g[3]))
        elif g[4] is not None and g[4]: segments.append((False, False, g[4]))
    return segments if segments else [(False, False, text)]


def parse_table_rows(lines):
    rows = []
    for line in lines:
        line = line.strip()
        if not line.startswith('|'):
            continue
        if re.match(r'^\|[\s\-|:]+\|$', line):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        rows.append(cells)
    return rows


def md_to_pdf(md_path, pdf_path):
    with open(md_path, encoding='utf-8') as f:
        lines = [l.rstrip('\n') for l in f]

    pdf = MarkdownPDF()
    pdf.add_page()

    i             = 0
    in_code_block = False
    code_lines    = []
    table_lines   = []
    in_table      = False
    FENCE         = chr(96) * 3

    while i < len(lines):
        line     = lines[i]
        stripped = line.strip()

        # code fence detection
        if stripped.startswith(FENCE):
            if in_code_block:
                pdf.draw_code_block(code_lines)
                code_lines    = []
                in_code_block = False
            else:
                if in_table:
                    pdf.draw_table(parse_table_rows(table_lines))
                    table_lines, in_table = [], False
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # table rows
        is_tbl = stripped.startswith('|') and '|' in line[1:]
        if is_tbl:
            in_table = True
            table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                pdf.draw_table(parse_table_rows(table_lines))
                table_lines, in_table = [], False

        # horizontal rule
        if re.match(r'^-{3,}$', stripped) or re.match(r'^\*{3,}$', stripped):
            pdf.draw_hr()
            i += 1
            continue

        # headings (check longest prefix first)
        m_h4 = re.match(r'^####\s+(.*)', line)
        m_h3 = re.match(r'^###\s+(.*)',  line)
        m_h2 = re.match(r'^##\s+(.*)',   line)
        m_h1 = re.match(r'^#\s+(.*)',    line)
        if m_h4: pdf.draw_h4(m_h4.group(1).strip());         i += 1; continue
        if m_h3: pdf.draw_h3(m_h3.group(1).strip());         i += 1; continue
        if m_h2: pdf.draw_h2(m_h2.group(1).strip());         i += 1; continue
        if m_h1: pdf.draw_h1_banner(m_h1.group(1).strip());  i += 1; continue

        # blockquote
        if stripped.startswith('>'):
            pdf.draw_blockquote(stripped.lstrip('> ').strip())
            i += 1
            continue

        # bullet and numbered lists
        m_b = re.match(r'^(\s*)[-*+]\s+(.*)', line)
        m_n = re.match(r'^(\s*)\d+\.\s+(.*)', line)
        if m_b:
            pdf.write_bullet(m_b.group(2).strip(), level=len(m_b.group(1))//2)
            i += 1
            continue
        if m_n:
            pdf.write_bullet(m_n.group(2).strip(), level=len(m_n.group(1))//2)
            i += 1
            continue

        # blank line
        if stripped == '':
            pdf.ln(2)
            i += 1
            continue

        # regular paragraph
        pdf.write_paragraph(stripped)
        i += 1

    # flush any remaining block
    if in_table    and table_lines:  pdf.draw_table(parse_table_rows(table_lines))
    if in_code_block and code_lines: pdf.draw_code_block(code_lines)

    pdf.output(pdf_path)
    size = os.path.getsize(pdf_path)
    print(f'  Written: {pdf_path}  ({size:,} bytes)')
    return size


if __name__ == '__main__':
    base = 'C:/Users/sevar/Desktop/IRVE_Dashboard'
    jobs = [
        (f'{base}/RAPPORT.md',         f'{base}/RAPPORT.pdf'),
        (f'{base}/RAPPORT_DONNEES.md',  f'{base}/RAPPORT_DONNEES.pdf'),
    ]
    all_ok = True
    for md, pdf in jobs:
        if not os.path.exists(md):
            print(f'ERROR: source not found: {md}')
            all_ok = False
            continue
        print(f'Processing {os.path.basename(md)} ...')
        size = md_to_pdf(md, pdf)
        if size < 10_000:
            print(f'  WARNING: suspiciously small ({size} bytes)')
            all_ok = False
    print()
    if all_ok:
        print('All PDFs generated successfully.')
    else:
        print('Check warnings above.')
