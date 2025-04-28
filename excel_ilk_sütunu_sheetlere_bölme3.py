import pandas as pd
import os
import tkinter as tk
from tkinter import filedialog, ttk
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
import time

def process_excel(file_path, progress, label):
    # Excel dosyasını oku
    start_time = time.time()
    df = pd.read_excel(file_path)
    total_rows = len(df)
    
    # İlk sütundaki benzersiz değerleri al
    unique_values = df.iloc[:, 0].unique()
    
    # "bölünmüş dosyalar" adında bir klasör oluştur
    folder_path = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop', 'bölünmüş dosyalar1')
    os.makedirs(folder_path, exist_ok=True)
    
    for value in unique_values:
        # Her benzersiz değer için bir dosya oluştur
        file_name = os.path.join(folder_path, f"{value}.xlsx")
        filtered_df = df[df.iloc[:, 0] == value]
        
        with pd.ExcelWriter(file_name) as writer:
            filtered_df.to_excel(writer, index=False)
        
        progress['value'] += 1 / len(unique_values) * 100
        label.config(text=f"Oluşturulan Dosya Sayısı: {len(unique_values)}")
        root.update_idletasks()
    
    end_time = time.time()
    print(f"İşlem süresi: {end_time - start_time} saniye")

def select_file():
    desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
    
    file_path = filedialog.askopenfilename(initialdir=desktop, filetypes=[("Excel files", "*.xlsx *.xls")])
    if file_path:
        progress['value'] = 0
        sheet_counter_label.config(text="Oluşturulan Dosya Sayısı: 0")
        process_excel(file_path, progress, sheet_counter_label)

root = tk.Tk()
root.title("Excel İşleyici")

frame = tk.Frame(root, padx=10, pady=10)
frame.pack(padx=10, pady=10)

button_select = tk.Button(frame, text="Excel Dosyası Seç", command=select_file)
button_select.pack(pady=10)

progress = ttk.Progressbar(frame, orient="horizontal", length=300, mode="determinate")
progress.pack(pady=10)

sheet_counter_label = tk.Label(frame, text="Oluşturulan Dosya Sayısı: 0")
sheet_counter_label.pack(pady=10)

root.mainloop()
