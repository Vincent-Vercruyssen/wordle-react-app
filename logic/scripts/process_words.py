# process word list

import re
import sys, os
import argparse


def main(input_file, output_file, word_length):
    # read input file
    with open(input_file, "r") as inputf:
        lines = inputf.readlines()

    # filter
    output_lines = []
    for line in lines:
        l = line.strip().strip("\n")

        # only word_length (e.g., 5)
        if len(l) != word_length:
            continue

        # no numbers
        if has_numbers(l):
            continue

        # only alphabetic
        if not (l.isalpha()):
            continue

        # no capital letters (cities, names...)
        if has_capital(l):
            continue

        output_lines.append(l + "\n")

    # store
    with open(output_file, "w+") as outputf:
        outputf.writelines(output_lines)


# filter out numbers
def has_numbers(string):
    return bool(re.search(r"\d", string))


# filter out names, cities...
def has_capital(string):
    return any(c.isupper() for c in string)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file", help="path to the input file", type=str)
    parser.add_argument("output_file", help="path to the output file", type=str)
    parser.add_argument("word_length", help="extract words of this length", type=int)
    args = parser.parse_args()
    sys.exit(main(args.input_file, args.output_file, args.word_length))
