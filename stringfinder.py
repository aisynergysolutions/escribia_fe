import os

def find_string_in_files(search_string, folder_path):
    matches = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        if search_string in line:
                            matches.append(file_path)
                            break
            except Exception:
                continue
    return matches

# Example usage as a script or from another Python file:
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python stringfinder.py <search_string> <folder_path>")
        sys.exit(1)
    search_string = sys.argv[1]
    folder_path = sys.argv[2]
    result = find_string_in_files(search_string, folder_path)
    for path in result:
        print(path)