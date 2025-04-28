import pandas as pd

# Create a sample DataFrame for testing
data = {
    'Category': ['A', 'B', 'A', 'C', 'B', 'D', 'C', 'A'],
    'Value': [10, 20, 15, 5, 25, 30, 10, 50],
    'Name': ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta']
}

df = pd.DataFrame(data)

# Save to Excel for testing
output_path = 'test_excel.xlsx'
df.to_excel(output_path, index=False)

print(f"[Download the test Excel file]({output_path})")
