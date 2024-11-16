import random

def create_empty_matrix(size):
    return [[0 for _ in range(size)] for _ in range(size)]

def is_valid_position(matrix, ship, row, col, direction):
    for i in range(ship):
        r, c = (row + i, col) if direction == 'vertical' else (row, col + i)
        if r < 0 or r >= len(matrix) or c < 0 or c >= len(matrix) or matrix[r][c] != 0:
            return False

        for dr in range(-1, 2):
            for dc in range(-1, 2):
                nr, nc = r + dr, c + dc
                if 0 <= nr < len(matrix) and 0 <= nc < len(matrix) and matrix[nr][nc] == 1:
                    return False
    return True

def place_ship(matrix, ship):

    size = len(matrix)
    while True:
        direction = random.choice(['horizontal', 'vertical'])
        row, col = random.randint(0, size - 1), random.randint(0, size - 1)
        if is_valid_position(matrix, ship, row, col, direction):
            for i in range(ship):
                r, c = (row + i, col) if direction == 'vertical' else (row, col + i)
                matrix[r][c] = 1
            break

def generate_battleship_matrix():

    matrix = create_empty_matrix(10)
    ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1] 
    for ship in ships:
        place_ship(matrix, ship)
    return matrix

matrices = [generate_battleship_matrix() for _ in range(20)]

